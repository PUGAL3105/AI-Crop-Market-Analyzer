import math
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date

from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user
from backend.app.models.models import User, Market, Recommendation, HistoricalPrice, WeatherData
from backend.app.schemas.schemas import RecommendationRequest, RecommendationResponse, RecommendationDetail, MarketResponse
from ml.src.predict import Predictor

router = APIRouter(prefix="/markets", tags=["Markets & Recommendations"])
predictor = Predictor(model_dir="C:/Market Analyser/ml/models")

# District Coordinates for Distance Calculations
DISTRICT_COORDS = {
    "Ariyalur": (11.1401, 79.0786),
    "Chengalpattu": (12.6917, 79.9792),
    "Chennai": (13.0827, 80.2707),
    "Coimbatore": (11.0168, 76.9558),
    "Cuddalore": (11.7480, 79.7714),
    "Dharmapuri": (12.1275, 78.1578),
    "Dindigul": (10.3673, 77.9806),
    "Erode": (11.3410, 77.7172),
    "Kallakurichi": (11.7379, 78.9626),
    "Kancheepuram": (12.8342, 79.7036),
    "Karur": (10.9601, 78.0766),
    "Krishnagiri": (12.5186, 78.2137),
    "Madurai": (9.9252, 78.1198),
    "Mayiladuthurai": (11.1018, 79.6522),
    "Nagapattinam": (10.7656, 79.8424),
    "Namakkal": (11.2189, 78.1674),
    "Nilgiris": (11.4102, 76.6950),
    "Perambalur": (11.2333, 78.8833),
    "Pudukkottai": (10.3797, 78.8242),
    "Ramanathapuram": (9.3639, 78.8394),
    "Ranipet": (12.9272, 79.3328),
    "Salem": (11.6643, 78.1460),
    "Sivaganga": (9.8433, 78.4803),
    "Tenkasi": (8.9591, 77.3144),
    "Thanjavur": (10.7870, 79.1378),
    "Theni": (10.0104, 77.4777),
    "Thoothukudi": (8.7642, 78.1348),
    "Tiruchirappalli": (10.8158, 78.6947),
    "Tirunelveli": (8.7139, 77.7567),
    "Tirupathur": (12.4926, 78.5678),
    "Tiruppur": (11.1085, 77.3411),
    "Tiruvallur": (13.1419, 79.9071),
    "Tiruvannamalai": (12.2253, 79.0747),
    "Tiruvarur": (10.7719, 79.6381),
    "Vellore": (12.9165, 79.1325),
    "Viluppuram": (11.9401, 79.4861),
    "Virudhunagar": (9.5872, 77.9514),
    "Kanyakumari": (8.0883, 77.5385)
}

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculates great-circle distance in kilometers."""
    R = 6371.0 # Earth's radius in km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

@router.get("", response_model=list[MarketResponse])
def get_all_markets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Market).all()

@router.post("/recommend", response_model=RecommendationResponse)
def get_selling_recommendation(
    request: RecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    crop = request.crop
    quantity = request.quantity_kg
    harvest_date_str = request.harvest_date
    current_district = request.current_district
    
    # Get current district coordinates
    user_coords = DISTRICT_COORDS.get(current_district, (13.0827, 80.2707)) # default Chennai
    
    # 1. Fetch all markets
    markets = db.query(Market).all()
    if not markets:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No markets registered in database."
        )
        
    recommendations_list = []
    
    # 2. Compute metrics for each market
    for market in markets:
        # Distance
        distance = haversine_distance(user_coords[0], user_coords[1], market.latitude, market.longitude)
        distance = round(max(5.0, distance), 2)  # minimum 5 km
        
        # Transport Cost = distance * rate * (1 + load_factor)
        # load factor increases cost slightly if carrying a lot (e.g. per ton)
        load_factor = 1.0 + (quantity / 1000.0) * 0.05
        transport_cost = round(distance * market.base_transport_cost_per_km * load_factor, 2)
        
        # Storage Cost: e.g. Rs 0.15 per kg
        storage_cost = round(quantity * 0.15, 2)
        
        # Get crop price prediction at this market
        # Query cached price history
        db_prices = db.query(HistoricalPrice).filter(
            HistoricalPrice.crop_name == crop,
            HistoricalPrice.market_id == market.id
        ).order_by(HistoricalPrice.record_date.desc()).limit(7).all()
        
        history_prices = []
        if db_prices:
            db_prices = sorted(db_prices, key=lambda x: x.record_date)
            history_prices = [p.price_per_kg for p in db_prices]
            
        # Get weather for market district
        today = date.today()
        db_weather = db.query(WeatherData).filter(
            WeatherData.district == market.district,
            WeatherData.recorded_date <= today
        ).order_by(WeatherData.recorded_date.desc()).first()
        
        weather_dict = {"temperature": 27.5, "rainfall": 45.0, "humidity": 65.0, "wind_speed": 7.5}
        if db_weather:
            weather_dict = {
                "temperature": db_weather.temperature,
                "rainfall": db_weather.rainfall,
                "humidity": db_weather.humidity,
                "wind_speed": db_weather.wind_speed
            }
            
        pred_res = predictor.predict_price_and_explain(
            crop=crop,
            district=market.district,
            market=market.name,
            quantity=quantity,
            harvest_date=harvest_date_str,
            weather_info=weather_dict,
            history_prices=history_prices
        )
        
        predicted_price = pred_res["predicted_price"]
        expected_profit = round(predicted_price * quantity, 2)
        net_profit = round(expected_profit - transport_cost - storage_cost, 2)
        
        # Recommended selling date logic
        # If price trend is going up, recommend selling slightly later (e.g. 5 days after harvest)
        # If trend is going down, sell immediately (harvest date)
        harvest_dt = datetime.strptime(harvest_date_str, "%Y-%m-%d").date()
        if pred_res["price_trend"] == "up":
            # Add 5 days
            recommended_date = harvest_dt.replace(day=min(28, harvest_dt.day + 5))
        else:
            recommended_date = harvest_dt
            
        recommendations_list.append(RecommendationDetail(
            market_id=market.id,
            market_name=market.name,
            district=market.district,
            distance_km=distance,
            transport_cost=transport_cost,
            storage_cost=storage_cost,
            expected_profit=expected_profit,
            net_profit=net_profit,
            recommended_selling_date=recommended_date.strftime("%Y-%m-%d")
        ))
        
    # Sort recommendations by net profit descending
    recommendations_list = sorted(recommendations_list, key=lambda x: x.net_profit, reverse=True)
    
    # 3. Save the best recommendation in database for this user
    best_rec = recommendations_list[0]
    best_rec_date = datetime.strptime(best_rec.recommended_selling_date, "%Y-%m-%d").date()
    harvest_date_dt = datetime.strptime(harvest_date_str, "%Y-%m-%d").date()
    
    db_rec = Recommendation(
        user_id=current_user.id,
        crop_name=crop,
        quantity_kg=quantity,
        harvest_date=harvest_date_dt,
        best_market_id=best_rec.market_id,
        distance_km=best_rec.distance_km,
        transport_cost=best_rec.transport_cost,
        storage_cost=best_rec.storage_cost,
        expected_profit=best_rec.expected_profit,
        net_profit=best_rec.net_profit,
        recommended_selling_date=best_rec_date
    )
    db.add(db_rec)
    db.commit()
    
    return RecommendationResponse(
        crop_name=crop,
        quantity_kg=quantity,
        harvest_date=harvest_date_str,
        recommendations=recommendations_list
    )
