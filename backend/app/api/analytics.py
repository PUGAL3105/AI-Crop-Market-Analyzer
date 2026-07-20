from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import List, Dict, Any

from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user
from backend.app.models.models import User, HistoricalPrice, Market
from backend.app.schemas.schemas import HistoricalPriceResponse

router = APIRouter(prefix="/analytics", tags=["Analytics & Historical Trends"])

@router.get("/crops", response_model=List[str])
def get_unique_crops(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch unique crop names from historical records."""
    crops = db.query(HistoricalPrice.crop_name).distinct().all()
    return [c[0] for c in crops]

@router.get("/historical", response_model=List[HistoricalPriceResponse])
def get_historical_trends(
    crop: str = Query(..., description="Crop name"),
    market_id: str = Query(..., description="UUID of the market"),
    range_days: int = Query(30, description="Range of days to look back"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve historical prices for a crop at a market over a given time range."""
    # Look up market
    market = db.query(Market).filter(Market.id == market_id).first()
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")
        
    start_date = date.today() - timedelta(days=range_days)
    
    prices = db.query(HistoricalPrice).filter(
        HistoricalPrice.crop_name == crop,
        HistoricalPrice.market_id == market_id,
        HistoricalPrice.record_date >= start_date
    ).order_by(HistoricalPrice.record_date.asc()).all()
    
    return [
        HistoricalPriceResponse(
            date=p.record_date.strftime("%Y-%m-%d"),
            price_per_kg=p.price_per_kg
        ) for p in prices
    ]

@router.get("/comparison")
def compare_market_prices(
    crop: str = Query(..., description="Crop name"),
    market_ids: str = Query(..., description="Comma-separated UUIDs of markets to compare"),
    range_days: int = Query(30, description="Range of days to look back"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compare prices of a crop across multiple markets."""
    market_id_list = market_ids.split(",")
    start_date = date.today() - timedelta(days=range_days)
    
    comparison_data = {}
    
    for m_id in market_id_list:
        market = db.query(Market).filter(Market.id == m_id).first()
        if not market:
            continue
            
        prices = db.query(HistoricalPrice).filter(
            HistoricalPrice.crop_name == crop,
            HistoricalPrice.market_id == m_id,
            HistoricalPrice.record_date >= start_date
        ).order_by(HistoricalPrice.record_date.asc()).all()
        
        comparison_data[market.name] = [
            {"date": p.record_date.strftime("%Y-%m-%d"), "price": p.price_per_kg}
            for p in prices
        ]
        
    return comparison_data
