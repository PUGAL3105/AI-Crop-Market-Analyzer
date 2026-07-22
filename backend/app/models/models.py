import uuid
from sqlalchemy import Column, String, Float, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="farmer", nullable=False)  # admin | farmer | researcher
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class FarmerProfile(Base):
    __tablename__ = "farmers"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    farm_size_hectares = Column(Float, nullable=True)
    primary_crops = Column(Text, nullable=True)  # Comma-separated list
    location_district = Column(String(100), nullable=True)
    location_market = Column(String(100), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="farmer_profile")

class Market(Base):
    __tablename__ = "markets"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, index=True, nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    base_transport_cost_per_km = Column(Float, nullable=False)
    
    # Relationships
    historical_prices = relationship("HistoricalPrice", back_populates="market", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="market", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", foreign_keys="Recommendation.best_market_id", back_populates="best_market")

class HistoricalPrice(Base):
    __tablename__ = "historical_prices"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    crop_name = Column(String(100), nullable=False, index=True)
    market_id = Column(String(36), ForeignKey("markets.id", ondelete="CASCADE"), nullable=False, index=True)
    price_per_kg = Column(Float, nullable=False)
    record_date = Column(Date, nullable=False, index=True)
    
    # Relationships
    market = relationship("Market", back_populates="historical_prices")

class WeatherData(Base):
    __tablename__ = "weather_data"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    district = Column(String(100), nullable=False, index=True)
    recorded_date = Column(Date, nullable=False, index=True)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    forecast_json = Column(Text, nullable=True)  # Detailed 7-day forecast

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    crop_name = Column(String(100), nullable=False)
    market_id = Column(String(36), ForeignKey("markets.id", ondelete="CASCADE"), nullable=False)
    predicted_price = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)  # low | medium | high
    target_date = Column(Date, nullable=False)
    prediction_date = Column(DateTime, default=datetime.utcnow)
    model_used = Column(String(100), nullable=False)
    shap_values_json = Column(Text, nullable=True)  # Explanations
    
    # Relationships
    market = relationship("Market", back_populates="predictions")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    harvest_date = Column(Date, nullable=False)
    best_market_id = Column(String(36), ForeignKey("markets.id"), nullable=False)
    distance_km = Column(Float, nullable=False)
    transport_cost = Column(Float, nullable=False)
    storage_cost = Column(Float, nullable=False)
    expected_profit = Column(Float, nullable=False)
    net_profit = Column(Float, nullable=False)
    recommended_selling_date = Column(Date, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="recommendations")
    best_market = relationship("Market", foreign_keys=[best_market_id], back_populates="recommendations")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="notifications")

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    level = Column(String(50), nullable=False)  # INFO | WARNING | ERROR
    message = Column(Text, nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
