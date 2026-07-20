import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "AgriPredict Pro"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "SUPER_SECRET_KEY_AGRI_PREDICT_PRO_2026_HEAI")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Database
    # Default to local SQLite database in workspace if no PostgreSQL URL is provided
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///C:/Market Analyser/agripredict.db"
    )
    
    # ML Paths
    MODEL_DIR: str = os.getenv("MODEL_DIR", "C:/Market Analyser/ml/models")
    DATA_DIR: str = os.getenv("DATA_DIR", "C:/Market Analyser/ml/data")
    
    # Weather Configuration
    WEATHER_API_URL: str = "https://api.open-meteo.com/v1/forecast"
    
    class Config:
        case_sensitive = True

settings = Settings()
