from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# --- USER SCHEMAS ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=2)
    role: str = Field("farmer", description="Must be one of: farmer, researcher, admin")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    email: str
    full_name: str

# --- FARMER SCHEMAS ---
class FarmerProfileUpdate(BaseModel):
    farm_size_hectares: Optional[float] = None
    primary_crops: Optional[str] = None  # Comma-separated
    location_district: Optional[str] = None
    location_market: Optional[str] = None

class FarmerProfileResponse(BaseModel):
    id: str
    user_id: str
    farm_size_hectares: Optional[float]
    primary_crops: Optional[str]
    location_district: Optional[str]
    location_market: Optional[str]
    
    class Config:
        from_attributes = True

# --- MARKET SCHEMAS ---
class MarketCreate(BaseModel):
    name: str
    district: str
    state: str
    latitude: float
    longitude: float
    base_transport_cost_per_km: float

class MarketResponse(BaseModel):
    id: str
    name: str
    district: str
    state: str
    latitude: float
    longitude: float
    base_transport_cost_per_km: float
    
    class Config:
        from_attributes = True

# --- PREDICTION SCHEMAS ---
class WeatherInput(BaseModel):
    temperature: float
    rainfall: float
    humidity: float
    wind_speed: float

class PredictionRequest(BaseModel):
    crop: str
    district: str
    market: str
    quantity: float = Field(..., gt=0)
    harvest_date: str = Field(..., description="Format YYYY-MM-DD")
    weather_info: Optional[WeatherInput] = None
    history_prices: Optional[List[float]] = None

class PredictionResponse(BaseModel):
    predicted_price: float
    confidence_score: float
    risk_level: str
    expected_profit: float
    price_trend: str
    shap_explanations: Dict[str, float]
    model_used: str
    target_date: str

# --- RECOMMENDATION SCHEMAS ---
class RecommendationRequest(BaseModel):
    crop: str
    quantity_kg: float = Field(..., gt=0)
    harvest_date: str = Field(..., description="Format YYYY-MM-DD")
    current_district: str

class RecommendationDetail(BaseModel):
    market_id: str
    market_name: str
    district: str
    distance_km: float
    transport_cost: float
    storage_cost: float
    expected_profit: float
    net_profit: float
    recommended_selling_date: str

class RecommendationResponse(BaseModel):
    crop_name: str
    quantity_kg: float
    harvest_date: str
    recommendations: List[RecommendationDetail]

# --- WEATHER SCHEMAS ---
class WeatherResponse(BaseModel):
    district: str
    recorded_date: str
    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    forecast: List[Dict[str, Any]]

# --- ANALYTICS SCHEMAS ---
class HistoricalPriceResponse(BaseModel):
    date: str
    price_per_kg: float

class ComparisonResponse(BaseModel):
    market_name: str
    prices: List[Dict[str, Any]]  # List of {date, price}

# --- NOTIFICATION SCHEMAS ---
class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- SYSTEM LOG SCHEMAS ---
class SystemLogResponse(BaseModel):
    id: str
    level: str
    message: str
    details: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
