import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_mock_data(output_dir="ml/data", num_years=2):
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Define Markets
    markets_data = [
        {"name": "Koyambedu Market", "district": "Chennai", "state": "Tamil Nadu", "latitude": 13.0683, "longitude": 80.1908, "base_transport_cost_per_km": 2.2},
        {"name": "Ottanchatram Market", "district": "Dindigul", "state": "Tamil Nadu", "latitude": 10.5144, "longitude": 77.7850, "base_transport_cost_per_km": 2.0},
        {"name": "Mettupalayam Market", "district": "Coimbatore", "state": "Tamil Nadu", "latitude": 11.3006, "longitude": 76.9405, "base_transport_cost_per_km": 2.5},
        {"name": "Panruti Market", "district": "Cuddalore", "state": "Tamil Nadu", "latitude": 11.7708, "longitude": 79.5539, "base_transport_cost_per_km": 2.1},
        {"name": "Thalaivasal Market", "district": "Salem", "state": "Tamil Nadu", "latitude": 11.5833, "longitude": 78.7500, "base_transport_cost_per_km": 2.3},
        {"name": "Erode Turmeric Market", "district": "Erode", "state": "Tamil Nadu", "latitude": 11.3410, "longitude": 77.7172, "base_transport_cost_per_km": 1.9},
        {"name": "Madurai Central Market", "district": "Madurai", "state": "Tamil Nadu", "latitude": 9.9252, "longitude": 78.1198, "base_transport_cost_per_km": 2.2},
        {"name": "Trichy Gandhi Market", "district": "Tiruchirappalli", "state": "Tamil Nadu", "latitude": 10.8158, "longitude": 78.6947, "base_transport_cost_per_km": 2.0},
        {"name": "Tirupur Mandi", "district": "Tirupur", "state": "Tamil Nadu", "latitude": 11.1085, "longitude": 77.3411, "base_transport_cost_per_km": 2.4},
        {"name": "Pollachi Market", "district": "Coimbatore", "state": "Tamil Nadu", "latitude": 10.6588, "longitude": 77.0097, "base_transport_cost_per_km": 2.3},
        {"name": "Salem Agricultural Market", "district": "Salem", "state": "Tamil Nadu", "latitude": 11.6643, "longitude": 78.1460, "base_transport_cost_per_km": 2.1},
        {"name": "Dharmapuri Regulated Market", "district": "Dharmapuri", "state": "Tamil Nadu", "latitude": 12.1275, "longitude": 78.1578, "base_transport_cost_per_km": 2.0},
        {"name": "Vellore Mandi", "district": "Vellore", "state": "Tamil Nadu", "latitude": 12.9165, "longitude": 79.1325, "base_transport_cost_per_km": 2.2},
        {"name": "Theni Allinagaram Market", "district": "Theni", "state": "Tamil Nadu", "latitude": 10.0104, "longitude": 77.4777, "base_transport_cost_per_km": 1.8},
        {"name": "Thanjavur Market", "district": "Thanjavur", "state": "Tamil Nadu", "latitude": 10.7870, "longitude": 79.1378, "base_transport_cost_per_km": 2.1},
        {"name": "Tirunelveli Market", "district": "Tirunelveli", "state": "Tamil Nadu", "latitude": 8.7139, "longitude": 77.7567, "base_transport_cost_per_km": 2.3},
        {"name": "Nagercoil Vadasery Market", "district": "Kanyakumari", "state": "Tamil Nadu", "latitude": 8.1884, "longitude": 77.4113, "base_transport_cost_per_km": 2.4},
        {"name": "Villupuram Mandi", "district": "Villupuram", "state": "Tamil Nadu", "latitude": 11.9401, "longitude": 79.4861, "base_transport_cost_per_km": 2.1},
        {"name": "Thoothukudi Market", "district": "Thoothukudi", "state": "Tamil Nadu", "latitude": 8.7642, "longitude": 78.1348, "base_transport_cost_per_km": 2.5},
        {"name": "Namakkal Poultry Market", "district": "Namakkal", "state": "Tamil Nadu", "latitude": 11.2189, "longitude": 78.1674, "base_transport_cost_per_km": 1.9}
    ]
    df_markets = pd.DataFrame(markets_data)
    df_markets["market_id"] = [f"m_{i+1}" for i in range(len(df_markets))]
    df_markets.to_csv(os.path.join(output_dir, "markets.csv"), index=False)
    print(f"Generated {len(df_markets)} markets and saved to {output_dir}/markets.csv")

    # 2. Define Crops & Base Parameters
    crops = {
        "Rice": {"base_price": 30.0, "peak_month": 11, "weather_sens": 0.4},
        "Wheat": {"base_price": 25.0, "peak_month": 4, "weather_sens": 0.3},
        "Cotton": {"base_price": 70.0, "peak_month": 10, "weather_sens": 0.5},
        "Maize": {"base_price": 20.0, "peak_month": 9, "weather_sens": 0.3},
        "Tomato": {"base_price": 15.0, "peak_month": 7, "weather_sens": 0.8},
        "Potato": {"base_price": 12.0, "peak_month": 3, "weather_sens": 0.4},
        "Onion": {"base_price": 18.0, "peak_month": 12, "weather_sens": 0.7},
        "Turmeric": {"base_price": 80.0, "peak_month": 5, "weather_sens": 0.5},
        "Coconut": {"base_price": 25.0, "peak_month": 6, "weather_sens": 0.3},
        "Banana": {"base_price": 35.0, "peak_month": 8, "weather_sens": 0.6},
        "Sugarcane": {"base_price": 5.0, "peak_month": 1, "weather_sens": 0.4},
        "Mango": {"base_price": 50.0, "peak_month": 5, "weather_sens": 0.7},
        "Groundnut": {"base_price": 60.0, "peak_month": 11, "weather_sens": 0.4},
        "Chili": {"base_price": 120.0, "peak_month": 2, "weather_sens": 0.5}
    }

    # 3. Generate Time Series Data
    start_date = datetime.now() - timedelta(days=365 * num_years)
    date_list = [start_date + timedelta(days=x) for x in range(365 * num_years)]
    
    records = []
    
    np.random.seed(42)
    
    for dt in date_list:
        month = dt.month
        day_of_year = dt.timetuple().tm_yday
        year = dt.year
        
        # Base weather generator (seasonal)
        temp_base = 25.0 + 8.0 * np.sin(2 * np.pi * (day_of_year - 140) / 365)
        rain_base = 100.0 * np.exp(-((day_of_year - 210)**2) / (2 * 40**2)) if 150 < day_of_year < 280 else 5.0
        
        for crop, c_info in crops.items():
            base_p = c_info["base_price"]
            peak_m = c_info["peak_month"]
            sens = c_info["weather_sens"]
            
            seasonal_mult = 1.0 + 0.25 * np.cos(2 * np.pi * (month - peak_m) / 12)
            inflation_mult = 1.0 + 0.04 * (year - start_date.year)
            
            for mkt in markets_data:
                temp = temp_base + np.random.normal(0, 0.2)
                rain = max(0.0, rain_base + np.random.normal(0, 2.0))
                humidity = min(100.0, max(20.0, 60.0 + 20.0 * np.sin(2 * np.pi * (day_of_year - 200) / 365) + np.random.normal(0, 1.0)))
                wind_speed = max(1.0, 8.0 + 4.0 * np.sin(2 * np.pi * (day_of_year - 120) / 365) + np.random.normal(0, 0.5))
                
                mkt_noise = np.random.normal(0, 0.005)
                
                weather_impact = 0.0
                if rain > 120.0 and crop in ["Tomato", "Onion"]:
                    weather_impact = (rain - 120.0) * 0.005 * sens
                elif rain < 10.0 and month in [7, 8, 9]:
                    weather_impact = (10.0 - rain) * 0.003 * sens
                
                weekday = dt.weekday()
                weekly_mult = 1.0 + 0.15 * np.sin(2 * np.pi * weekday / 7)
                
                price = base_p * seasonal_mult * inflation_mult * weekly_mult * (1.0 + mkt_noise + weather_impact)
                price = max(5.0, round(price, 2))
                
                records.append({
                    "date": dt.strftime("%Y-%m-%d"),
                    "crop": crop,
                    "district": mkt["district"],
                    "market": mkt["name"],
                    "price_per_kg": price,
                    "temperature": round(temp, 2),
                    "rainfall": round(rain, 2),
                    "humidity": round(humidity, 2),
                    "wind_speed": round(wind_speed, 2)
                })
                
    df_history = pd.DataFrame(records)
    df_history.to_csv(os.path.join(output_dir, "historical_prices.csv"), index=False)
    print(f"Generated {len(df_history)} historical price records and saved to {output_dir}/historical_prices.csv")

if __name__ == "__main__":
    generate_mock_data(num_years=2)
