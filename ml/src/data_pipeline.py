import os
import pickle
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder

class DataPipeline:
    def __init__(self, data_path="ml/data/historical_prices.csv", seq_length=7):
        self.data_path = data_path
        self.seq_length = seq_length
        self.encoders = {}
        self.feature_cols = []
        self.cat_cols = ["crop", "district", "market"]
        self.num_cols = ["temperature", "rainfall", "humidity", "wind_speed", "day_of_year", "month"]
        
    def load_and_preprocess(self, fit_encoders=True):
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Historical price data not found at {self.data_path}")
            
        df = pd.read_csv(self.data_path)
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values(by=["crop", "market", "date"]).reset_index(drop=True)
        
        # Extract date features
        df["day_of_year"] = df["date"].dt.dayofyear
        df["month"] = df["date"].dt.month
        df["year"] = df["date"].dt.year
        df["day_of_week"] = df["date"].dt.dayofweek
        
        # Categorical Encoding
        for col in self.cat_cols:
            if fit_encoders:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col])
                self.encoders[col] = le
            else:
                le = self.encoders[col]
                # Handle unseen categories by adding a default if needed
                df[col] = df[col].map(lambda s: le.transform([s])[0] if s in le.classes_ else -1)
                
        # Generate Lag and Rolling features
        # Lag prices
        for lag in range(1, self.seq_length + 1):
            df[f"price_lag_{lag}"] = df.groupby(["crop", "market"])["price_per_kg"].shift(lag)
            
        # Rolling averages
        df["price_roll_mean_3"] = df.groupby(["crop", "market"])["price_per_kg"].shift(1).rolling(3).mean()
        df["price_roll_mean_7"] = df.groupby(["crop", "market"])["price_per_kg"].shift(1).rolling(7).mean()
        
        # Drop rows with NaN due to shift/rolling
        df = df.dropna().reset_index(drop=True)
        return df

    def prepare_datasets(self, df):
        """
        Prepares training and test datasets.
        Returns:
            X_seq: sequential arrays (num_samples, seq_length, 1) for LSTM
            X_tab: tabular features (num_samples, num_tab_features)
            X_flat: combined flattened inputs for baseline ML models
            y: target prices
        """
        # Sequential features (historical prices)
        lag_cols = [f"price_lag_{i}" for i in range(1, self.seq_length + 1)]
        # Reverse lag columns so they go chronologically (lag_7, lag_6, ..., lag_1)
        lag_cols = lag_cols[::-1]
        
        X_seq = df[lag_cols].values.reshape(-1, self.seq_length, 1)
        
        # Tabular features
        # We include encoded crop, district, market and current weather/time variables
        tab_cols = self.cat_cols + self.num_cols
        X_tab = df[tab_cols].values
        
        # Flattened features for simple ML models (LR, DT, RF, XGBoost)
        # Combines tabular features and lag prices
        X_flat = df[tab_cols + lag_cols + ["price_roll_mean_3", "price_roll_mean_7"]].values
        self.feature_cols = tab_cols + lag_cols + ["price_roll_mean_3", "price_roll_mean_7"]
        
        y = df["price_per_kg"].values
        
        # Train-test split (chronological split to prevent data leakage in time-series)
        # Last 15% is test set
        split_idx = int(len(df) * 0.85)
        
        return {
            "train": {
                "seq": X_seq[:split_idx],
                "tab": X_tab[:split_idx],
                "flat": X_flat[:split_idx],
                "y": y[:split_idx]
            },
            "test": {
                "seq": X_seq[split_idx:],
                "tab": X_tab[split_idx:],
                "flat": X_flat[split_idx:],
                "y": y[split_idx:]
            }
        }

    def save_artifacts(self, model_dir="ml/models"):
        os.makedirs(model_dir, exist_ok=True)
        artifacts = {
            "encoders": self.encoders,
            "feature_cols": self.feature_cols,
            "seq_length": self.seq_length,
            "cat_cols": self.cat_cols,
            "num_cols": self.num_cols
        }
        with open(os.path.join(model_dir, "preprocessing_artifacts.pkl"), "wb") as f:
            pickle.dump(artifacts, f)
        print(f"Saved preprocessing artifacts to {model_dir}/preprocessing_artifacts.pkl")

    def load_artifacts(self, model_dir="ml/models"):
        filepath = os.path.join(model_dir, "preprocessing_artifacts.pkl")
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Preprocessing artifacts not found at {filepath}")
            
        with open(filepath, "rb") as f:
            artifacts = pickle.load(f)
            
        self.encoders = artifacts["encoders"]
        self.feature_cols = artifacts["feature_cols"]
        self.seq_length = artifacts["seq_length"]
        self.cat_cols = artifacts["cat_cols"]
        self.num_cols = artifacts["num_cols"]
        print("Loaded preprocessing artifacts successfully.")
