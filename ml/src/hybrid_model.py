import os
import numpy as np
import pandas as pd

# Try to import TensorFlow and XGBoost; prepare fallback flags if not present
HAS_TENSORFLOW = False
HAS_XGBOOST = False

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    HAS_TENSORFLOW = True
except ImportError:
    print("Warning: TensorFlow not found. Hybrid model will fall back to Random Forest / Gradient Boosting sequential logic.")

try:
    import xgboost as xgb
    HAS_XGBOOST = True
except ImportError:
    print("Warning: XGBoost not found. Hybrid model will fall back to Scikit-learn regressors.")

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler

class HybridLSTMXGBoostModel:
    def __init__(self, sequence_length=7):
        self.sequence_length = sequence_length
        self.lstm_scaler = StandardScaler()
        self.tabular_scaler = StandardScaler()
        self.is_trained = False
        
        # Models
        self.lstm_model = None
        self.xgb_model = None
        
        # Fallback Models (if libraries missing)
        self.fallback_lstm = None
        self.fallback_xgb = None

    def _build_lstm(self, input_shape):
        """Constructs LSTM architecture if TensorFlow is available."""
        if not HAS_TENSORFLOW:
            return None
        model = Sequential([
            LSTM(64, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(32, return_sequences=False),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse')
        return model

    def fit(self, X_seq, X_tab, y, epochs=15, batch_size=32):
        """
        Fits the Hybrid model.
        X_seq: numpy array of shape (num_samples, sequence_length, num_seq_features)
               representing historical price sequences.
        X_tab: numpy array of shape (num_samples, num_tab_features)
               representing additional context like crop, district, weather.
        y: numpy array of shape (num_samples,) representing targets.
        """
        # 1. Fit sequential (LSTM) component
        # Reshape or scale X_seq
        num_samples, seq_len, seq_feats = X_seq.shape
        X_seq_flat = X_seq.reshape(-1, seq_feats)
        X_seq_scaled_flat = self.lstm_scaler.fit_transform(X_seq_flat)
        X_seq_scaled = X_seq_scaled_flat.reshape(num_samples, seq_len, seq_feats)
        
        if HAS_TENSORFLOW:
            print("Fitting LSTM network...")
            self.lstm_model = self._build_lstm((seq_len, seq_feats))
            self.lstm_model.fit(X_seq_scaled, y, epochs=epochs, batch_size=batch_size, verbose=0)
            lstm_preds = self.lstm_model.predict(X_seq_scaled).flatten()
        else:
            # Fallback: Train a simple Random Forest on sequence data
            print("Fitting Fallback Sequential Random Forest...")
            self.fallback_lstm = RandomForestRegressor(n_estimators=50, random_state=42)
            # Flatten sequences to feed to Random Forest
            X_seq_rf = X_seq.reshape(num_samples, -1)
            self.fallback_lstm.fit(X_seq_rf, y)
            lstm_preds = self.fallback_lstm.predict(X_seq_rf)

        # 2. Add sequential prediction as feature to tabular variables
        X_tab_scaled = self.tabular_scaler.fit_transform(X_tab)
        X_combined = np.hstack([X_tab_scaled, lstm_preds.reshape(-1, 1)])

        # 3. Fit XGBoost / Tabular component
        if HAS_XGBOOST:
            print("Fitting XGBoost regressor...")
            self.xgb_model = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42)
            self.xgb_model.fit(X_combined, y)
        else:
            print("Fitting Fallback Tabular Gradient Booster...")
            self.fallback_xgb = GradientBoostingRegressor(n_estimators=100, max_depth=6, random_state=42)
            self.fallback_xgb.fit(X_combined, y)
            
        self.is_trained = True
        print("Hybrid Model Training Completed Successfully.")

    def predict(self, X_seq, X_tab):
        """
        Generates final predictions using sequential prediction + tabular features.
        """
        if not self.is_trained:
            raise ValueError("Model is not trained yet.")
            
        num_samples, seq_len, seq_feats = X_seq.shape
        X_seq_flat = X_seq.reshape(-1, seq_feats)
        X_seq_scaled_flat = self.lstm_scaler.transform(X_seq_flat)
        X_seq_scaled = X_seq_scaled_flat.reshape(num_samples, seq_len, seq_feats)
        
        if HAS_TENSORFLOW and self.lstm_model is not None:
            lstm_preds = self.lstm_model.predict(X_seq_scaled).flatten()
        else:
            X_seq_rf = X_seq.reshape(num_samples, -1)
            lstm_preds = self.fallback_lstm.predict(X_seq_rf)

        X_tab_scaled = self.tabular_scaler.transform(X_tab)
        X_combined = np.hstack([X_tab_scaled, lstm_preds.reshape(-1, 1)])
        
        if HAS_XGBOOST and self.xgb_model is not None:
            return self.xgb_model.predict(X_combined)
        else:
            return self.fallback_xgb.predict(X_combined)
