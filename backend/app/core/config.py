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
    @property
    def REAL_DATABASE_URL(self) -> str:
        env_db = os.getenv("DATABASE_URL")
        if env_db:
            # Fix legacy Heroku/Vercel postgres:// schema for SQLAlchemy
            if env_db.startswith("postgres://"):
                return env_db.replace("postgres://", "postgresql://", 1)
            return env_db
        
        # Default SQLite path: /tmp for serverless environment, local file otherwise
        if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME") or not os.access(".", os.W_OK):
            return "sqlite:////tmp/agripredict.db"
        
        root_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "agripredict.db"))
        return f"sqlite:///{root_db_path}"
    
    DATABASE_URL: str = ""
    
    # ML Paths
    MODEL_DIR: str = os.getenv(
        "MODEL_DIR", 
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "models"))
    )
    DATA_DIR: str = os.getenv(
        "DATA_DIR", 
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "data"))
    )
    
    # Weather Configuration
    WEATHER_API_URL: str = "https://api.open-meteo.com/v1/forecast"
    
    class Config:
        case_sensitive = True

settings = Settings()

# Dynamically set DATABASE_URL property
if not settings.DATABASE_URL:
    settings.DATABASE_URL = settings.REAL_DATABASE_URL
