from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.core.security import verify_password, get_password_hash, create_access_token
from backend.app.models.models import User, FarmerProfile, Notification
from backend.app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token, FarmerProfileUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login-form")

# Dependency to get current user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# Helper to check role permissions
def check_role(required_roles: list):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation restricted. Required roles: {required_roles}"
            )
        return current_user
    return dependency

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    # Create user
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        password_hash=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # If registering as a farmer, initialize farmer profile
    if db_user.role == "farmer":
        profile = FarmerProfile(user_id=db_user.id)
        db.add(profile)
        
        # Add welcome notification
        welcome_notif = Notification(
            user_id=db_user.id,
            title="Welcome to AgriPredict Pro!",
            message="Your account has been created. Start predicting market prices and get selling recommendations."
        )
        db.add(welcome_notif)
        db.commit()
        
    return db_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
        
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "email": user.email,
        "full_name": user.full_name
    }

# FastAPI built-in OAuth2 compatibility endpoint for Swagger UI login
from fastapi.security import OAuth2PasswordRequestForm
@router.post("/login-form", response_model=Token, include_in_schema=False)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "email": user.email,
        "full_name": user.full_name
    }

@router.post("/forgot-password")
def forgot_password(request: dict, db: Session = Depends(get_db)):
    email = request.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
         raise HTTPException(status_code=404, detail="Email not registered")
         
    return {"message": "Password reset code sent. Please check your registered email address."}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Return user details + profile details if farmer
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "created_at": current_user.created_at
    }
    
    if current_user.role == "farmer":
        profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
        if profile:
            user_data["profile"] = {
                "farm_size_hectares": profile.farm_size_hectares,
                "primary_crops": profile.primary_crops,
                "location_district": profile.location_district,
                "location_market": profile.location_market
            }
            
    return user_data

@router.put("/farmer-profile")
def update_profile(profile_in: FarmerProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Profile update is only available for farmers")
        
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    if not profile:
        profile = FarmerProfile(user_id=current_user.id)
        db.add(profile)
        
    if profile_in.farm_size_hectares is not None:
        profile.farm_size_hectares = profile_in.farm_size_hectares
    if profile_in.primary_crops is not None:
        profile.primary_crops = profile_in.primary_crops
    if profile_in.location_district is not None:
        profile.location_district = profile_in.location_district
    if profile_in.location_market is not None:
        profile.location_market = profile_in.location_market
        
    db.commit()
    db.refresh(profile)
    return {"message": "Profile updated successfully", "profile": profile}
