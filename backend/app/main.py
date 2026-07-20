import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml", "src")))
import csv
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.core.security import get_password_hash
from backend.app.models.models import User, FarmerProfile, Market, HistoricalPrice, SystemLog, Notification

# Import Routers
from backend.app.api.auth import router as auth_router
from backend.app.api.predictions import router as predictions_router
from backend.app.api.markets import router as markets_router
from backend.app.api.weather import router as weather_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.admin import router as admin_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Hybrid Explainable AI Framework for Agricultural Market Price Prediction and Intelligent Selling Recommendation",
    version="1.0.0"
)

# CORS Configuration
# Allow local React dev environment and production deploys
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(predictions_router, prefix=settings.API_V1_STR)
app.include_router(markets_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    # 1. Create tables automatically on startup
    print("Database initialization starting...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 2. Seed Default Markets if not present (Upgrade count < 35)
        if db.query(Market).count() < 35:
            print("Seeding/Upgrading Tamil Nadu markets...")
            db.query(Market).delete()
            db.commit()
            
            markets_data = [
                {"name": "Koyambedu Market", "district": "Chennai", "state": "Tamil Nadu", "latitude": 13.0683, "longitude": 80.1908, "base_transport_cost_per_km": 2.2},
                {"name": "Ottanchatram Market", "district": "Dindigul", "state": "Tamil Nadu", "latitude": 10.5144, "longitude": 77.7850, "base_transport_cost_per_km": 2.0},
                {"name": "Mettupalayam Market", "district": "Coimbatore", "state": "Tamil Nadu", "latitude": 11.3006, "longitude": 76.9405, "base_transport_cost_per_km": 2.5},
                {"name": "Panruti Market", "district": "Cuddalore", "state": "Tamil Nadu", "latitude": 11.7708, "longitude": 79.5539, "base_transport_cost_per_km": 2.1},
                {"name": "Thalaivasal Market", "district": "Salem", "state": "Tamil Nadu", "latitude": 11.5833, "longitude": 78.7500, "base_transport_cost_per_km": 2.3},
                {"name": "Erode Turmeric Market", "district": "Erode", "state": "Tamil Nadu", "latitude": 11.3410, "longitude": 77.7172, "base_transport_cost_per_km": 1.9},
                {"name": "Madurai Central Market", "district": "Madurai", "state": "Tamil Nadu", "latitude": 9.9252, "longitude": 78.1198, "base_transport_cost_per_km": 2.2},
                {"name": "Trichy Gandhi Market", "district": "Tiruchirappalli", "state": "Tamil Nadu", "latitude": 10.8158, "longitude": 78.6947, "base_transport_cost_per_km": 2.0},
                {"name": "Tirupur Mandi", "district": "Tiruppur", "state": "Tamil Nadu", "latitude": 11.1085, "longitude": 77.3411, "base_transport_cost_per_km": 2.4},
                {"name": "Pollachi Market", "district": "Coimbatore", "state": "Tamil Nadu", "latitude": 10.6588, "longitude": 77.0097, "base_transport_cost_per_km": 2.3},
                {"name": "Salem Agricultural Market", "district": "Salem", "state": "Tamil Nadu", "latitude": 11.6643, "longitude": 78.1460, "base_transport_cost_per_km": 2.1},
                {"name": "Dharmapuri Regulated Market", "district": "Dharmapuri", "state": "Tamil Nadu", "latitude": 12.1275, "longitude": 78.1578, "base_transport_cost_per_km": 2.0},
                {"name": "Vellore Mandi", "district": "Vellore", "state": "Tamil Nadu", "latitude": 12.9165, "longitude": 79.1325, "base_transport_cost_per_km": 2.2},
                {"name": "Theni Allinagaram Market", "district": "Theni", "state": "Tamil Nadu", "latitude": 10.0104, "longitude": 77.4777, "base_transport_cost_per_km": 1.8},
                {"name": "Thanjavur Market", "district": "Thanjavur", "state": "Tamil Nadu", "latitude": 10.7870, "longitude": 79.1378, "base_transport_cost_per_km": 2.1},
                {"name": "Tirunelveli Market", "district": "Tirunelveli", "state": "Tamil Nadu", "latitude": 8.7139, "longitude": 77.7567, "base_transport_cost_per_km": 2.3},
                {"name": "Nagercoil Vadasery Market", "district": "Kanyakumari", "state": "Tamil Nadu", "latitude": 8.1884, "longitude": 77.4113, "base_transport_cost_per_km": 2.4},
                {"name": "Villupuram Mandi", "district": "Viluppuram", "state": "Tamil Nadu", "latitude": 11.9401, "longitude": 79.4861, "base_transport_cost_per_km": 2.1},
                {"name": "Thoothukudi Market", "district": "Thoothukudi", "state": "Tamil Nadu", "latitude": 8.7642, "longitude": 78.1348, "base_transport_cost_per_km": 2.5},
                {"name": "Namakkal Poultry Market", "district": "Namakkal", "state": "Tamil Nadu", "latitude": 11.2189, "longitude": 78.1674, "base_transport_cost_per_km": 1.9},
                
                # New Tamil Nadu Markets to cover all 38 districts
                {"name": "Jayankondam Regulated Market", "district": "Ariyalur", "state": "Tamil Nadu", "latitude": 11.2086, "longitude": 79.1174, "base_transport_cost_per_km": 2.0},
                {"name": "Tambaram Vegetable Market", "district": "Chengalpattu", "state": "Tamil Nadu", "latitude": 12.9229, "longitude": 80.1274, "base_transport_cost_per_km": 2.1},
                {"name": "Kallakurichi Agricultural Market", "district": "Kallakurichi", "state": "Tamil Nadu", "latitude": 11.7379, "longitude": 78.9626, "base_transport_cost_per_km": 2.0},
                {"name": "Kancheepuram Wholesale Market", "district": "Kancheepuram", "state": "Tamil Nadu", "latitude": 12.8342, "longitude": 79.7036, "base_transport_cost_per_km": 2.2},
                {"name": "Karur Agricultural Market", "district": "Karur", "state": "Tamil Nadu", "latitude": 10.9601, "longitude": 78.0766, "base_transport_cost_per_km": 1.9},
                {"name": "Krishnagiri Mango Market", "district": "Krishnagiri", "state": "Tamil Nadu", "latitude": 12.5186, "longitude": 78.2137, "base_transport_cost_per_km": 2.3},
                {"name": "Mayiladuthurai Mandi", "district": "Mayiladuthurai", "state": "Tamil Nadu", "latitude": 11.1018, "longitude": 79.6522, "base_transport_cost_per_km": 2.0},
                {"name": "Nagapattinam Port Market", "district": "Nagapattinam", "state": "Tamil Nadu", "latitude": 10.7656, "longitude": 79.8424, "base_transport_cost_per_km": 2.1},
                {"name": "Ooty Hill Vegetable Market", "district": "Nilgiris", "state": "Tamil Nadu", "latitude": 11.4102, "longitude": 76.6950, "base_transport_cost_per_km": 2.6},
                {"name": "Perambalur Cotton Market", "district": "Perambalur", "state": "Tamil Nadu", "latitude": 11.2333, "longitude": 78.8833, "base_transport_cost_per_km": 2.0},
                {"name": "Pudukkottai Regulated Market", "district": "Pudukkottai", "state": "Tamil Nadu", "latitude": 10.3797, "longitude": 78.8242, "base_transport_cost_per_km": 1.9},
                {"name": "Ramanathapuram Chili Yard", "district": "Ramanathapuram", "state": "Tamil Nadu", "latitude": 9.3639, "longitude": 78.8394, "base_transport_cost_per_km": 2.2},
                {"name": "Ranipet Wholesale Market", "district": "Ranipet", "state": "Tamil Nadu", "latitude": 12.9272, "longitude": 79.3328, "base_transport_cost_per_km": 2.1},
                {"name": "Karaikudi Mandi", "district": "Sivaganga", "state": "Tamil Nadu", "latitude": 10.0747, "longitude": 78.7844, "base_transport_cost_per_km": 2.0},
                {"name": "Tenkasi Vegetable Market", "district": "Tenkasi", "state": "Tamil Nadu", "latitude": 8.9591, "longitude": 77.3144, "base_transport_cost_per_km": 2.1},
                {"name": "Tirupathur Market", "district": "Tirupathur", "state": "Tamil Nadu", "latitude": 12.4926, "longitude": 78.5678, "base_transport_cost_per_km": 2.0},
                {"name": "Tiruvallur Regulated Market", "district": "Tiruvallur", "state": "Tamil Nadu", "latitude": 13.1419, "longitude": 79.9071, "base_transport_cost_per_km": 2.1},
                {"name": "Tiruvannamalai Grain Market", "district": "Tiruvannamalai", "state": "Tamil Nadu", "latitude": 12.2253, "longitude": 79.0747, "base_transport_cost_per_km": 2.0},
                {"name": "Tiruvarur Paddy Market", "district": "Tiruvarur", "state": "Tamil Nadu", "latitude": 10.7719, "longitude": 79.6381, "base_transport_cost_per_km": 1.8},
                {"name": "Virudhunagar Spice Market", "district": "Virudhunagar", "state": "Tamil Nadu", "latitude": 9.5872, "longitude": 77.9514, "base_transport_cost_per_km": 2.1}
            ]
            for m in markets_data:
                db_m = Market(**m)
                db.add(db_m)
            db.commit()
            print("Tamil Nadu markets seeded successfully.")

        # 3. Seed Default Users (Admin, Farmer, Researcher)
        if db.query(User).count() == 0:
            print("Seeding default role accounts...")
            
            # Default accounts configurations
            accounts = [
                {"email": "admin@agripredict.pro", "name": "System Administrator", "role": "admin"},
                {"email": "farmer@agripredict.pro", "name": "Ramesh Kumar (Farmer)", "role": "farmer"},
                {"email": "researcher@agripredict.pro", "name": "Dr. Sunita Sharma (Scientist)", "role": "researcher"}
            ]
            
            for acc in accounts:
                hashed = get_password_hash("password123")
                user = User(
                    email=acc["email"],
                    password_hash=hashed,
                    full_name=acc["name"],
                    role=acc["role"]
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                
                # If farmer, create a default profile
                if user.role == "farmer":
                    profile = FarmerProfile(
                        user_id=user.id,
                        farm_size_hectares=4.5,
                        primary_crops="Rice,Tomato,Turmeric",
                        location_district="Chennai",
                        location_market="Koyambedu Market"
                    )
                    db.add(profile)
                    
                    # Add mock notification
                    notif = Notification(
                        user_id=user.id,
                        title="Market Price Alert",
                        message="Tomato prices are predicted to rise by 15% next week due to high seasonal rains in Western Mandis."
                    )
                    db.add(notif)
                    db.commit()
            print("Default user accounts seeded. Password is 'password123'.")

        # 4. Check & Load Historical Crop Price Data
        if db.query(HistoricalPrice).count() == 0:
            print("Loading historical price records into database...")
            data_file = "C:/Market Analyser/ml/data/historical_prices.csv"
            
            # If historical csv is not generated, run mock generator
            if not os.path.exists(data_file):
                print("Historical CSV not found. Generating mock files...")
                from ml.data.mock_generator import generate_mock_data
                generate_mock_data(output_dir="C:/Market Analyser/ml/data", num_years=2)
                
            # Read and insert prices
            # Market objects map
            market_map = {m.name: m.id for m in db.query(Market).all()}
            
            records_to_insert = []
            with open(data_file, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    market_name = row.get("market")
                    m_id = market_map.get(market_name)
                    if not m_id:
                        continue
                        
                    records_to_insert.append(HistoricalPrice(
                        crop_name=row.get("crop"),
                        market_id=m_id,
                        price_per_kg=float(row.get("price_per_kg")),
                        record_date=datetime.strptime(row.get("date"), "%Y-%m-%d").date()
                    ))
            
            if records_to_insert:
                print(f"Inserting {len(records_to_insert)} historical price rows...")
                # Insert in chunks of 5000 to keep it efficient in SQLite
                chunk_size = 5000
                for i in range(0, len(records_to_insert), chunk_size):
                    db.bulk_save_objects(records_to_insert[i:i + chunk_size])
                    db.commit()
                print("Historical prices loaded.")

        # Log system status
        startup_log = SystemLog(
            level="INFO",
            message="AgriPredict Pro system backend started successfully. Seed data verified."
        )
        db.add(startup_log)
        db.commit()
        
    except Exception as e:
        print(f"Startup seeding failed with error: {e}")
        db.rollback()
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "project": "AgriPredict Pro",
        "description": "Hybrid Explainable AI Framework for Agricultural Market Price Prediction",
        "docs": "/docs"
    }
