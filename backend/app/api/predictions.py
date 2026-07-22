import os
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date

from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user
from backend.app.models.models import User, Prediction, Market, HistoricalPrice, WeatherData
from backend.app.schemas.schemas import PredictionRequest, PredictionResponse
from ml.src.predict import Predictor

router = APIRouter(prefix="/predictions", tags=["Predictions"])

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "models"))
predictor = Predictor(model_dir=MODEL_DIR)

@router.post("/predict", response_model=PredictionResponse)
def predict_crop_price(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    crop = request.crop
    district = request.district
    market_name = request.market
    quantity = request.quantity
    harvest_date_str = request.harvest_date
    
    # 1. Look up market
    market = db.query(Market).filter(Market.name == market_name).first()
    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Market '{market_name}' is not supported in the database."
        )
        
    # 2. Retrieve history prices if not provided
    history_prices = request.history_prices
    if not history_prices or len(history_prices) < 7:
        # Fetch last 7 historical price entries
        db_prices = db.query(HistoricalPrice).filter(
            HistoricalPrice.crop_name == crop,
            HistoricalPrice.market_id == market.id
        ).order_by(HistoricalPrice.record_date.desc()).limit(7).all()
        
        if db_prices:
            # We sort ascending by date
            db_prices = sorted(db_prices, key=lambda x: x.record_date)
            history_prices = [p.price_per_kg for p in db_prices]
            
        # If still empty or insufficient, pad with defaults
        if not history_prices or len(history_prices) == 0:
            # Simple base prices fallback
            base_prices = {"Rice": 30.0, "Wheat": 25.0, "Cotton": 70.0, "Maize": 20.0, "Tomato": 15.0, "Potato": 12.0, "Onion": 18.0}
            base_p = base_prices.get(crop, 20.0)
            history_prices = [round(base_p * (1.0 + i * 0.005), 2) for i in range(7)]
            
    # 3. Retrieve weather details if not provided
    weather_info = request.weather_info
    if not weather_info:
        # Look up cached weather for this district
        today = date.today()
        db_weather = db.query(WeatherData).filter(
            WeatherData.district == district,
            WeatherData.recorded_date <= today
        ).order_by(WeatherData.recorded_date.desc()).first()
        
        if db_weather:
            weather_info = {
                "temperature": db_weather.temperature,
                "rainfall": db_weather.rainfall,
                "humidity": db_weather.humidity,
                "wind_speed": db_weather.wind_speed
            }
        else:
            # Reasonable default weather depending on crop
            weather_info = {
                "temperature": 27.5,
                "rainfall": 45.0,
                "humidity": 65.0,
                "wind_speed": 7.5
            }
            
    # 4. Invoke Prediction & Explanation Pipeline
    # Convert weather_info to expected dictionary format
    weather_dict = {
        "temperature": float(weather_info["temperature"]) if isinstance(weather_info, dict) else weather_info.temperature,
        "rainfall": float(weather_info["rainfall"]) if isinstance(weather_info, dict) else weather_info.rainfall,
        "humidity": float(weather_info["humidity"]) if isinstance(weather_info, dict) else weather_info.humidity,
        "wind_speed": float(weather_info["wind_speed"]) if isinstance(weather_info, dict) else weather_info.wind_speed
    }
    
    result = predictor.predict_price_and_explain(
        crop=crop,
        district=district,
        market=market_name,
        quantity=quantity,
        harvest_date=harvest_date_str,
        weather_info=weather_dict,
        history_prices=history_prices
    )
    
    # 5. Save prediction in database
    target_dt = datetime.strptime(harvest_date_str, "%Y-%m-%d").date()
    db_pred = Prediction(
        crop_name=crop,
        market_id=market.id,
        predicted_price=result["predicted_price"],
        confidence_score=result["confidence_score"],
        risk_level=result["risk_level"],
        target_date=target_dt,
        model_used=result["model_used"],
        shap_values_json=json.dumps(result["shap_explanations"])
    )
    db.add(db_pred)
    db.commit()
    
    return {
        "predicted_price": result["predicted_price"],
        "confidence_score": result["confidence_score"],
        "risk_level": result["risk_level"],
        "expected_profit": result["expected_profit"],
        "price_trend": result["price_trend"],
        "shap_explanations": result["shap_explanations"],
        "model_used": result["model_used"],
        "target_date": harvest_date_str
    }
