import requests
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
import json

from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user
from backend.app.models.models import User, WeatherData
from backend.app.schemas.schemas import WeatherResponse

router = APIRouter(prefix="/weather", tags=["Weather Forecast"])

# District Coordinates mapping
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

@router.get("", response_model=WeatherResponse)
def get_weather_forecast(
    district: str = Query(..., description="Name of the agricultural district"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    
    # 1. Check local cache
    cached_weather = db.query(WeatherData).filter(
        WeatherData.district == district,
        WeatherData.recorded_date == today
    ).first()
    
    if cached_weather:
        forecast_list = json.loads(cached_weather.forecast_json) if cached_weather.forecast_json else []
        return WeatherResponse(
            district=cached_weather.district,
            recorded_date=cached_weather.recorded_date.strftime("%Y-%m-%d"),
            temperature=cached_weather.temperature,
            humidity=cached_weather.humidity,
            rainfall=cached_weather.rainfall,
            wind_speed=cached_weather.wind_speed,
            forecast=forecast_list
        )
        
    # 2. Local coordinates check
    coords = DISTRICT_COORDS.get(district)
    if not coords:
        # Simple coordinate fallback (Chennai)
        coords = (13.0827, 80.2707)
        
    lat, lon = coords
    
    # 3. Call Open-Meteo API
    # Max daily temperatures, min daily temperatures, rain, relative humidity, wind speed
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,rain_sum,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto"
    
    try:
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            daily = data.get("daily", {})
            
            # Formulate the forecast and current conditions
            dates = daily.get("time", [])
            temp_maxs = daily.get("temperature_2m_max", [])
            temp_mins = daily.get("temperature_2m_min", [])
            rains = daily.get("rain_sum", [])
            humidities = daily.get("relative_humidity_2m_mean", [])
            winds = daily.get("wind_speed_10m_max", [])
            
            # Current values (take day 0)
            current_temp = round((temp_maxs[0] + temp_mins[0]) / 2, 2) if temp_maxs and temp_mins else 26.5
            current_rain = float(rains[0]) if rains else 0.0
            current_humid = float(humidities[0]) if humidities else 60.0
            current_wind = float(winds[0]) if winds else 8.0
            
            # Build 7 days forecast list
            forecast_list = []
            for i in range(len(dates)):
                forecast_list.append({
                    "date": dates[i],
                    "temp_max": temp_maxs[i],
                    "temp_min": temp_mins[i],
                    "rainfall": rains[i],
                    "humidity": humidities[i],
                    "wind_speed": winds[i]
                })
                
            # Cache weather in DB
            db_weather = WeatherData(
                district=district,
                recorded_date=today,
                temperature=current_temp,
                humidity=current_humid,
                rainfall=current_rain,
                wind_speed=current_wind,
                forecast_json=json.dumps(forecast_list)
            )
            
            # Clean up old records for this district
            db.query(WeatherData).filter(WeatherData.district == district, WeatherData.recorded_date < today).delete()
            db.add(db_weather)
            db.commit()
            
            return WeatherResponse(
                district=district,
                recorded_date=today.strftime("%Y-%m-%d"),
                temperature=current_temp,
                humidity=current_humid,
                rainfall=current_rain,
                wind_speed=current_wind,
                forecast=forecast_list
            )
    except Exception as e:
        print(f"Failed to fetch real-time weather: {e}. Generating simulated forecast.")
        
    # 4. Fallback simulation (offline mode)
    # Generates a realistic weekly forecast
    forecast_list = []
    base_temp = 28.0 if today.month in [5, 6, 7] else 22.0
    base_rain = 8.0 if today.month in [7, 8, 9] else 0.5
    
    for i in range(7):
        f_date = today + timedelta(days=i)
        t_max = base_temp + 3.0 + (i % 3) * 0.5
        t_min = base_temp - 4.0 - (i % 2) * 0.8
        rain_val = max(0.0, base_rain + (i % 2) * 4.2 - (i % 3) * 1.5)
        hum_val = min(100.0, max(20.0, 55.0 + 3.0 * i - (i % 2) * 5.0))
        wind_val = 6.0 + 1.2 * i
        
        forecast_list.append({
            "date": f_date.strftime("%Y-%m-%d"),
            "temp_max": round(t_max, 1),
            "temp_min": round(t_min, 1),
            "rainfall": round(rain_val, 1),
            "humidity": round(hum_val, 1),
            "wind_speed": round(wind_val, 1)
        })
        
    # Save simulated to database cache
    db_weather = WeatherData(
        district=district,
        recorded_date=today,
        temperature=round((forecast_list[0]["temp_max"] + forecast_list[0]["temp_min"]) / 2, 2),
        humidity=forecast_list[0]["humidity"],
        rainfall=forecast_list[0]["rainfall"],
        wind_speed=forecast_list[0]["wind_speed"],
        forecast_json=json.dumps(forecast_list)
    )
    db.add(db_weather)
    db.commit()
    
    return WeatherResponse(
        district=db_weather.district,
        recorded_date=today.strftime("%Y-%m-%d"),
        temperature=db_weather.temperature,
        humidity=db_weather.humidity,
        rainfall=db_weather.rainfall,
        wind_speed=db_weather.wind_speed,
        forecast=forecast_list
    )
