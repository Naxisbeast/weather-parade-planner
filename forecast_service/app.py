from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import pandas as pd
import requests
import sys
import numpy as np

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

class RainfallPredictionRequest(BaseModel):
    temperature: float
    humidity: float
    pressure: float

class RainfallPredictionResponse(BaseModel):
    rainfall_probability: float
    risk_level: str  # 'low', 'moderate', 'high'
    predicted_rainfall_mm: float
    confidence: float

class DailyPrediction(BaseModel):
    date: str
    temperature: float
    humidity: float
    pressure: float
    wind_speed: float
    rainfall_probability: float
    predicted_rainfall_mm: float
    risk_level: str
    weather_description: str

class ThirtyDayForecastRequest(BaseModel):
    latitude: float
    longitude: float

class ThirtyDayForecastResponse(BaseModel):
    location: Dict[str, float]
    predictions: List[DailyPrediction]
    summary: Dict[str, Any]

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
        "endpoints": ["/forecast", "/predict-rainfall", "/thirty-day-forecast", "/health"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "model": "Prophet" if USE_PROPHET else "ARIMA"}

def predict_rainfall(temperature: float, humidity: float, pressure: float) -> Dict[str, Any]:
    """
    Predict rainfall probability and amount based on meteorological parameters.
    Uses empirical relationships and thresholds to make realistic predictions.
    """
    # Normalize inputs for better prediction
    # Standard atmospheric pressure at sea level is ~1013 hPa
    pressure_deviation = abs(pressure - 1013)
    
    # Calculate base probability using multiple factors
    # High humidity increases rain probability
    humidity_factor = max(0, (humidity - 40) / 60)  # 0 at 40%, 1 at 100%
    
    # Low pressure indicates storm systems
    pressure_factor = min(1, pressure_deviation / 30) if pressure < 1013 else 0
    
    # Temperature affects moisture capacity
    # Moderate temps (15-25°C) with high humidity are most conducive to rain
    if 15 <= temperature <= 25:
        temp_factor = 0.8
    elif 10 <= temperature < 15 or 25 < temperature <= 30:
        temp_factor = 0.5
    else:
        temp_factor = 0.2
    
    # Combine factors with weights
    # Humidity is most important (50%), pressure (30%), temperature (20%)
    base_probability = (
        humidity_factor * 0.5 + 
        pressure_factor * 0.3 + 
        temp_factor * 0.2
    )
    
    # Apply thresholds for realistic predictions
    # Avoid always predicting high risk
    if humidity < 50:
        base_probability *= 0.3  # Very low chance with low humidity
    elif humidity < 70:
        base_probability *= 0.6  # Moderate reduction
    
    # Cap the probability at realistic levels
    rainfall_probability = min(0.95, max(0.05, base_probability))
    
    # Estimate rainfall amount based on probability and humidity
    # Higher humidity + higher probability = more rain
    if rainfall_probability > 0.7:
        predicted_rainfall = (humidity / 100) * (rainfall_probability * 15)  # Up to ~15mm
    elif rainfall_probability > 0.4:
        predicted_rainfall = (humidity / 100) * (rainfall_probability * 8)   # Up to ~8mm
    else:
        predicted_rainfall = (humidity / 100) * (rainfall_probability * 3)   # Up to ~3mm
    
    # Determine risk level with more balanced thresholds
    if rainfall_probability > 0.65 and predicted_rainfall > 8:
        risk_level = "high"
    elif rainfall_probability > 0.35 or predicted_rainfall > 3:
        risk_level = "moderate"
    else:
        risk_level = "low"
    
    # Calculate confidence based on how extreme the factors are
    confidence = 0.6  # Base confidence
    if humidity > 80 or humidity < 30:
        confidence += 0.15
    if pressure_deviation > 20:
        confidence += 0.15
    if 15 <= temperature <= 25:
        confidence += 0.1
    
    confidence = min(0.95, confidence)
    
    return {
        "rainfall_probability": round(rainfall_probability, 3),
        "risk_level": risk_level,
        "predicted_rainfall_mm": round(predicted_rainfall, 2),
        "confidence": round(confidence, 3)
    }

@app.post("/predict-rainfall", response_model=RainfallPredictionResponse)
async def predict_rainfall_endpoint(request: RainfallPredictionRequest):
    """
    Predict rainfall based on temperature, humidity, and pressure.
    This endpoint provides AI-based rainfall predictions with balanced risk assessment.
    """
    try:
        result = predict_rainfall(
            request.temperature,
            request.humidity,
            request.pressure
        )
        return RainfallPredictionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/thirty-day-forecast", response_model=ThirtyDayForecastResponse)
async def thirty_day_forecast(request: ThirtyDayForecastRequest):
    """
    Generate 30-day weather forecast with AI-based rainfall predictions.
    This combines historical data patterns with current conditions.
    """
    try:
        # Calculate date range for historical data (last 90 days)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)
        
        start_str = start_date.strftime('%Y%m%d')
        end_str = end_date.strftime('%Y%m%d')
        
        # Fetch historical data from NASA
        df = fetch_nasa_power_data(
            request.latitude,
            request.longitude,
            start_str,
            end_str
        )
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No historical data available")
        
        # Calculate average conditions for baseline predictions
        avg_temp = df['temperature'].mean()
        avg_rainfall = df['rainfall'].mean()
        avg_windspeed = df['windspeed'].mean()
        
        # Generate 30 daily predictions
        predictions = []
        for day_offset in range(30):
            pred_date = end_date + timedelta(days=day_offset + 1)
            
            # Use seasonal variation (simplified sine wave based on day of year)
            day_of_year = pred_date.timetuple().tm_yday
            seasonal_temp_variation = 10 * np.sin(2 * np.pi * day_of_year / 365)
            
            # Predicted temperature with some variation
            pred_temp = avg_temp + seasonal_temp_variation
            
            # Estimate humidity (inverse relationship with temp, simplified)
            pred_humidity = max(30, min(95, 70 - (pred_temp - avg_temp) * 1.5))
            
            # Pressure variation (random walk around standard pressure)
            pred_pressure = 1013 + np.random.normal(0, 8)
            
            # Wind speed with some randomness
            pred_windspeed = max(0, avg_windspeed + np.random.normal(0, 2))
            
            # Use our rainfall prediction model
            rainfall_pred = predict_rainfall(pred_temp, pred_humidity, pred_pressure)
            
            # Determine weather description based on predictions
            if rainfall_pred['rainfall_probability'] > 0.7:
                weather_desc = "Rainy"
            elif rainfall_pred['rainfall_probability'] > 0.4:
                weather_desc = "Partly Cloudy"
            elif pred_temp > 30:
                weather_desc = "Hot and Sunny"
            elif pred_temp < 10:
                weather_desc = "Cold and Clear"
            else:
                weather_desc = "Clear"
            
            predictions.append(DailyPrediction(
                date=pred_date.strftime('%Y-%m-%d'),
                temperature=round(pred_temp, 1),
                humidity=round(pred_humidity, 1),
                pressure=round(pred_pressure, 1),
                wind_speed=round(pred_windspeed, 1),
                rainfall_probability=rainfall_pred['rainfall_probability'],
                predicted_rainfall_mm=rainfall_pred['predicted_rainfall_mm'],
                risk_level=rainfall_pred['risk_level'],
                weather_description=weather_desc
            ))
        
        # Calculate summary statistics
        high_risk_days = sum(1 for p in predictions if p.risk_level == 'high')
        moderate_risk_days = sum(1 for p in predictions if p.risk_level == 'moderate')
        low_risk_days = sum(1 for p in predictions if p.risk_level == 'low')
        avg_pred_temp = sum(p.temperature for p in predictions) / len(predictions)
        total_pred_rainfall = sum(p.predicted_rainfall_mm for p in predictions)
        
        summary = {
            "high_risk_days": high_risk_days,
            "moderate_risk_days": moderate_risk_days,
            "low_risk_days": low_risk_days,
            "average_temperature": round(avg_pred_temp, 1),
            "total_predicted_rainfall": round(total_pred_rainfall, 1),
            "forecast_period": f"{predictions[0].date} to {predictions[-1].date}"
        }
        
        return ThirtyDayForecastResponse(
            location={
                "latitude": request.latitude,
                "longitude": request.longitude
            },
            predictions=predictions,
            summary=summary
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")

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
