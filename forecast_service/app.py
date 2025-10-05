from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import pandas as pd
import requests
import sys

app = FastAPI(title="NASA Weather Forecast Service")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Try to import Prophet, fallback to statsmodels ARIMA
try:
    from prophet import Prophet
    USE_PROPHET = True
    print("✓ Using Prophet for forecasting")
except ImportError:
    print("⚠ Prophet not available, using ARIMA fallback")
    from statsmodels.tsa.arima.model import ARIMA
    USE_PROPHET = False

class ForecastRequest(BaseModel):
    latitude: float
    longitude: float
    start_date: str  # YYYYMMDD format
    end_date: str    # YYYYMMDD format
    forecast_months: Optional[int] = 12

class ForecastDataPoint(BaseModel):
    date: str  # ISO datetime
    temperature: float
    temperature_lower: Optional[float] = None
    temperature_upper: Optional[float] = None
    rainfall: Optional[float] = None
    windspeed: Optional[float] = None

class ForecastResponse(BaseModel):
    location: Dict[str, float]
    historical_period: Dict[str, str]
    forecast_period: Dict[str, str]
    summary_stats: Dict[str, Any]
    forecasts: List[ForecastDataPoint]
    recommendations: List[str]
    model_used: str

def fetch_nasa_power_data(lat: float, lon: float, start_date: str, end_date: str) -> pd.DataFrame:
    """Fetch historical weather data from NASA POWER API"""
    base_url = "https://power.larc.nasa.gov/api/temporal/daily/point"
    parameters = "T2M,PRECTOTCORR,WS2M"
    
    url = f"{base_url}?parameters={parameters}&start={start_date}&end={end_date}&latitude={lat}&longitude={lon}&format=JSON&community=AG"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Extract parameters
        params = data['properties']['parameter']
        temperatures = params.get('T2M', {})
        rainfall = params.get('PRECTOTCORR', {})
        windspeed = params.get('WS2M', {})
        
        # Convert to DataFrame
        dates = list(temperatures.keys())
        df = pd.DataFrame({
            'date': pd.to_datetime(dates, format='%Y%m%d'),
            'temperature': [temperatures[d] for d in dates],
            'rainfall': [rainfall.get(d, 0) for d in dates],
            'windspeed': [windspeed.get(d, 0) for d in dates]
        })
        
        return df
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NASA API error: {str(e)}")

def train_prophet_model(df: pd.DataFrame, column: str) -> List[Dict]:
    """Train Prophet model and generate forecasts"""
    prophet_df = df[['date', column]].rename(columns={'date': 'ds', column: 'y'})
    
    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=True,
        seasonality_mode='multiplicative'
    )
    model.fit(prophet_df)
    
    # Generate future dates (365 days = ~12 months)
    future = model.make_future_dataframe(periods=365, freq='D')
    forecast = model.predict(future)
    
    # Extract only future predictions
    future_forecast = forecast[forecast['ds'] > df['date'].max()]
    
    return [
        {
            'date': row['ds'].isoformat(),
            'value': float(row['yhat']),
            'lower': float(row['yhat_lower']),
            'upper': float(row['yhat_upper'])
        }
        for _, row in future_forecast.iterrows()
    ]

def train_arima_model(df: pd.DataFrame, column: str) -> List[Dict]:
    """Fallback ARIMA model for forecasting"""
    values = df[column].values
    
    try:
        # Fit ARIMA model (p=5, d=1, q=0)
        model = ARIMA(values, order=(5, 1, 0))
        fitted = model.fit()
        
        # Forecast 365 days
        forecast = fitted.forecast(steps=365)
        
        # Generate future dates
        last_date = df['date'].max()
        future_dates = [last_date + timedelta(days=i+1) for i in range(365)]
        
        # Calculate simple confidence intervals (±10%)
        return [
            {
                'date': date.isoformat(),
                'value': float(val),
                'lower': float(val * 0.9),
                'upper': float(val * 1.1)
            }
            for date, val in zip(future_dates, forecast)
        ]
    except Exception as e:
        print(f"ARIMA error: {e}")
        # Fallback to simple mean projection
        mean_val = values.mean()
        last_date = df['date'].max()
        future_dates = [last_date + timedelta(days=i+1) for i in range(365)]
        
        return [
            {
                'date': date.isoformat(),
                'value': float(mean_val),
                'lower': float(mean_val * 0.9),
                'upper': float(mean_val * 1.1)
            }
            for date in future_dates
        ]

def generate_recommendations(df: pd.DataFrame, temp_forecast: List[Dict]) -> List[str]:
    """Generate weather-based recommendations"""
    recommendations = []
    
    # Historical analysis
    avg_temp = df['temperature'].mean()
    max_temp = df['temperature'].max()
    min_temp = df['temperature'].min()
    avg_rain = df['rainfall'].mean()
    max_rain = df['rainfall'].max()
    avg_wind = df['windspeed'].mean()
    
    # Forecast analysis
    forecast_temps = [f['value'] for f in temp_forecast[:90]]  # Next 3 months
    forecast_avg = sum(forecast_temps) / len(forecast_temps)
    forecast_max = max(forecast_temps)
    forecast_min = min(forecast_temps)
    
    # Temperature recommendations
    if forecast_avg > 30:
        recommendations.append("⚠️ High temperatures expected - plan outdoor activities for early morning or evening")
    elif forecast_avg < 10:
        recommendations.append("❄️ Cold temperatures expected - ensure proper heating and winter clothing")
    
    if forecast_max > 35:
        recommendations.append("🌡️ Extreme heat likely - stay hydrated and avoid prolonged sun exposure")
    
    if forecast_min < 5:
        recommendations.append("🥶 Freezing conditions possible - protect water pipes and outdoor plants")
    
    # Rainfall recommendations
    if avg_rain > 5:
        recommendations.append("☔ High rainfall pattern detected - consider indoor backup plans for events")
    elif avg_rain < 1:
        recommendations.append("☀️ Low rainfall expected - good conditions for outdoor activities")
    
    if max_rain > 20:
        recommendations.append("🌧️ Heavy rainfall episodes in historical data - prepare for potential flooding")
    
    # Wind recommendations
    if avg_wind > 10:
        recommendations.append("💨 Windy conditions common - secure outdoor items and structures")
    
    # Seasonal advice
    if forecast_avg > avg_temp + 5:
        recommendations.append("📈 Temperatures trending higher than historical average")
    elif forecast_avg < avg_temp - 5:
        recommendations.append("📉 Temperatures trending lower than historical average")
    
    if not recommendations:
        recommendations.append("✓ Weather conditions appear favorable for most activities")
    
    return recommendations

@app.get("/")
def read_root():
    return {
        "service": "NASA Weather Forecast Service",
        "status": "running",
        "model": "Prophet" if USE_PROPHET else "ARIMA",
        "endpoints": ["/forecast", "/health"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "model": "Prophet" if USE_PROPHET else "ARIMA"}

@app.post("/forecast", response_model=ForecastResponse)
async def generate_forecast(request: ForecastRequest):
    """
    Generate weather forecast using historical NASA POWER data
    """
    try:
        # Fetch historical data
        df = fetch_nasa_power_data(
            request.latitude,
            request.longitude,
            request.start_date,
            request.end_date
        )
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No data available for specified location/dates")
        
        # Train models and generate forecasts
        if USE_PROPHET:
            temp_forecast = train_prophet_model(df, 'temperature')
            model_name = "Prophet"
        else:
            temp_forecast = train_arima_model(df, 'temperature')
            model_name = "ARIMA"
        
        # Calculate summary statistics
        summary_stats = {
            "historical_avg_temp": float(df['temperature'].mean()),
            "historical_max_temp": float(df['temperature'].max()),
            "historical_min_temp": float(df['temperature'].min()),
            "historical_avg_rainfall": float(df['rainfall'].mean()),
            "historical_total_rainfall": float(df['rainfall'].sum()),
            "historical_avg_windspeed": float(df['windspeed'].mean()),
            "forecast_avg_temp": float(sum(f['value'] for f in temp_forecast[:90]) / 90),  # 3-month avg
            "forecast_max_temp": float(max(f['upper'] for f in temp_forecast)),
            "forecast_min_temp": float(min(f['lower'] for f in temp_forecast))
        }
        
        # Generate recommendations
        recommendations = generate_recommendations(df, temp_forecast)
        
        # Format forecast data points (limit to requested months)
        days_to_return = request.forecast_months * 30
        forecast_points = [
            ForecastDataPoint(
                date=f['date'],
                temperature=f['value'],
                temperature_lower=f.get('lower'),
                temperature_upper=f.get('upper')
            )
            for f in temp_forecast[:days_to_return]
        ]
        
        # Calculate date ranges
        start_dt = datetime.strptime(request.start_date, '%Y%m%d')
        end_dt = datetime.strptime(request.end_date, '%Y%m%d')
        forecast_start = df['date'].max() + timedelta(days=1)
        forecast_end = forecast_start + timedelta(days=days_to_return - 1)
        
        return ForecastResponse(
            location={
                "latitude": request.latitude,
                "longitude": request.longitude
            },
            historical_period={
                "start": start_dt.isoformat(),
                "end": end_dt.isoformat()
            },
            forecast_period={
                "start": forecast_start.isoformat(),
                "end": forecast_end.isoformat()
            },
            summary_stats=summary_stats,
            forecasts=forecast_points,
            recommendations=recommendations,
            model_used=model_name
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
