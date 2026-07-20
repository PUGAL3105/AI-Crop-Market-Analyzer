# AgriPredict Pro - Explainable AI Market Intelligence Platform

AgriPredict Pro is a state-of-the-art agricultural price forecasting and sell-timing optimization platform. It utilizes local meteorological data, historical crop prices, and advanced machine learning models (including LSTM neural networks) to project spot price directions and deliver transparent, explainable feature importance ratings to farmers and analysts.

---

## 🛠️ Technology Stack & Languages

### 1. Languages
*   **Python**: Backend API development, data preprocessing pipelines, and Machine Learning model training.
*   **TypeScript / JavaScript**: Frontend React application logic, routing, and interactive visualization charts.
*   **SQL**: Relational database structure definitions and data queries.
*   **CSS / HTML**: UI structure and custom theme stylesheets (Tailwind CSS).

### 2. Frontend Web Application
*   **Framework**: [React.js](https://react.dev/) + [Vite](https://vite.dev/) (built with TypeScript) for ultra-fast load times.
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) for fluid responsive styling and automatic theme overrides.
*   **Charts & Visualizations**: [Chart.js](https://www.chartjs.org/) + [React-Chartjs-2](https://react-chartjs-2.js.org/) for highly interactive line trajectory, P&L bar charts, and feature explainers.
*   **Iconography**: [Lucide React](https://lucide.dev/) for high-contrast, scalable vector icons.

### 3. Backend REST API
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python) for asynchronous, high-performance API routing.
*   **Server**: [Uvicorn](https://www.uvicorn.org/) for running the ASGI server.
*   **Testing**: [Pytest](https://docs.pytest.org/) for automated unit and integration tests.

### 4. Machine Learning & AI Engine
*   **Algorithms**: Trains and evaluates 6 distinct engines (Linear Regression, Decision Trees, Random Forest, XGBoost, LSTM, and Hybrid models), saving the lowest-RMSE model.
*   **Model Explainer**: Integrates local [SHAP (SHapley Additive exPlanations)](https://shap.readthedocs.io/) metrics to display the positive or negative impact of environmental variables (temperature, rainfall, etc.) on the prediction.

### 5. Database Process
*   **Engine**: [SQLite](https://www.sqlite.org/) with [SQLAlchemy ORM](https://www.sqlalchemy.org/) for database transactions.
*   **Warehouse Design**: Organized in a Star-Schema dimensional layout:
    *   `FACT_Prices` (`crop_prices_fact`): Stores daily spot price records, rainfall, temperature, and humidity variables.
    *   `DIM_Markets` (`markets_dim`): Maps Tamil Nadu mandis, spatial coordinates, and base logistics transport costs.
    *   `DIM_Weather` (`weather_dim`): Stores historical weather matrices mapped to Tamil Nadu districts.

---

## 📱 Mobile & Desktop Customization (Responsiveness)

AgriPredict Pro is custom-optimized for all form factors:
*   **Responsive Viewport Grid**: Layout sections dynamically scale from standard desktop wide screens down to single-column phone screens (`grid-cols-1 md:grid-cols-3 lg:grid-cols-4`).
*   **Mobile Navigation Drawer**: Features a responsive sidebar overlay. It hides off-screen on tablets/mobiles and slides in smoothly using a menu toggle, retaining full navigation features.
*   **Responsive Charts**: Chart canvas adapters scale dynamically without breaking aspect ratios, wrapping legends, or truncating tooltips.
*   **Touch-Friendly UI**: Includes larger tap-target controls and slider adjustments for temperature and rainfall projections.

---

## 🚀 Running the Project in the Terminal

Follow these steps to run the application on your local machine:

### Prerequisites
*   Python 3.10+ installed
*   Node.js 18+ installed

### Step 1: Start the Backend FastAPI Server
1. Open a terminal window and navigate to the backend directory:
   ```bash
   cd "c:\Market Analyser\backend"
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Uvicorn dev server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The backend will be live at [http://127.0.0.1:8000](http://127.0.0.1:8000).*

### Step 2: Start the Frontend React Web Application
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd "c:\Market Analyser\frontend"
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be live at [http://localhost:5173](http://localhost:5173).*
