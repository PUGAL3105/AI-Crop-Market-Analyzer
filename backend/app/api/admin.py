import os
import csv
import json
import codecs
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List

from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user, check_role
from backend.app.models.models import User, Market, HistoricalPrice, SystemLog, FarmerProfile
from backend.app.schemas.schemas import UserResponse, MarketCreate, MarketResponse, SystemLogResponse
from ml.src.train import train_and_compare
from ml.src.predict import Predictor

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

# Security constraint: only admins allowed
admin_user_check = check_role(["admin"])

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user_check)
):
    """Retrieve all users in the system."""
    return db.query(User).all()

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user_check)
):
    """Delete a user account by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.post("/markets", response_model=MarketResponse, status_code=status.HTTP_201_CREATED)
def create_market(
    market_in: MarketCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user_check)
):
    """Register a new market with geographic locations and base transport costs."""
    existing = db.query(Market).filter(Market.name == market_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Market already registered")
        
    db_market = Market(
        name=market_in.name,
        district=market_in.district,
        state=market_in.state,
        latitude=market_in.latitude,
        longitude=market_in.longitude,
        base_transport_cost_per_km=market_in.base_transport_cost_per_km
    )
    db.add(db_market)
    db.commit()
    db.refresh(db_market)
    return db_market

@router.post("/upload-dataset")
def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(admin_user_check)
):
    """
    Import historical prices CSV.
    Expected headers: date (YYYY-MM-DD), crop, market, price_per_kg
    """
    if not file.filename.endswith(".csv"):
         raise HTTPException(status_code=400, detail="Only CSV datasets supported")
         
    try:
        csvReader = csv.DictReader(codecs.iterdecode(file.file, 'utf-8'))
        count = 0
        
        # Cache markets by name to speed up lookup
        market_cache = {m.name: m for m in db.query(Market).all()}
        
        # Read lines
        records_to_add = []
        for row in csvReader:
            # Parse row
            date_str = row.get("date")
            crop = row.get("crop")
            market_name = row.get("market")
            price_str = row.get("price_per_kg")
            
            if not all([date_str, crop, market_name, price_str]):
                continue
                
            rec_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            price = float(price_str)
            
            # Ensure market exists
            market = market_cache.get(market_name)
            if not market:
                # Log warning and ignore or create default market
                continue
                
            db_price = HistoricalPrice(
                crop_name=crop,
                market_id=market.id,
                price_per_kg=price,
                record_date=rec_date
            )
            records_to_add.append(db_price)
            count += 1
            
        if records_to_add:
            db.bulk_save_objects(records_to_add)
            db.commit()
            
        # Log event
        sys_log = SystemLog(
            level="INFO",
            message=f"Admin imported dataset '{file.filename}' containing {count} prices records."
        )
        db.add(sys_log)
        db.commit()
        
        return {"message": f"Successfully imported {count} historical price records."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to parse CSV: {str(e)}")

# Background task for model training
def run_model_training_task(db_session_factory):
    db = db_session_factory()
    try:
        log = SystemLog(level="INFO", message="Started background Machine Learning model retraining.")
        db.add(log)
        db.commit()
        
        # Run training pipeline
        train_and_compare()
        
        # Refresh predictions service reload
        # To refresh predictor state, we recreate predictor in API predictions module
        from backend.app.api.predictions import predictor as api_predictor
        api_predictor.load_resources()
        
        log_end = SystemLog(level="INFO", message="Machine Learning model retraining completed successfully.")
        db.add(log_end)
        db.commit()
    except Exception as e:
        log_err = SystemLog(level="ERROR", message="ML model training failed.", details=str(e))
        db.add(log_err)
        db.commit()
    finally:
        db.close()

@router.post("/train")
def trigger_training(
    background_tasks: BackgroundTasks,
    admin: User = Depends(admin_user_check),
    db: Session = Depends(get_db)
):
    """Trigger background ML model retraining and evaluation."""
    from backend.app.core.database import SessionLocal
    background_tasks.add_task(run_model_training_task, SessionLocal)
    return {"message": "Model training pipeline triggered. Check system logs for progress."}

@router.get("/logs", response_model=List[SystemLogResponse])
def view_system_logs(
    limit: int = 50,
    admin: User = Depends(admin_user_check),
    db: Session = Depends(get_db)
):
    """View recent system and training logs."""
    return db.query(SystemLog).order_by(SystemLog.created_at.desc()).limit(limit).all()
