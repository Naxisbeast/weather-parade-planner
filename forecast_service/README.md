# NASA Weather Forecast Microservice

FastAPI service that fetches NASA POWER weather data and generates forecasts using Prophet or ARIMA models.

## Features

- Fetches historical weather data from NASA POWER API
- Trains Prophet time-series models (or ARIMA fallback)
- Generates 12-month temperature forecasts with confidence intervals
- Provides weather-based recommendations
- CORS-enabled for React frontend

## Installation

### Windows

```cmd
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### macOS/Linux

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Running the Service

### Windows

```cmd
# Make sure virtual environment is activated
venv\Scripts\activate

# Run the FastAPI server
python app.py

# Or use uvicorn directly
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### macOS/Linux

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Run the FastAPI server
python app.py

# Or use uvicorn directly
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The service will be available at: **http://localhost:8000**

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

### GET /
Basic service info

### GET /health
Health check endpoint

### POST /forecast
Generate weather forecast

**Request Body:**
```json
{
  "latitude": -33.9249,
  "longitude": 18.4241,
  "start_date": "20240101",
  "end_date": "20241231",
  "forecast_months": 12
}
```

**Response:**
```json
{
  "location": {
    "latitude": -33.9249,
    "longitude": 18.4241
  },
  "historical_period": {
    "start": "2024-01-01T00:00:00",
    "end": "2024-12-31T00:00:00"
  },
  "forecast_period": {
    "start": "2025-01-01T00:00:00",
    "end": "2025-12-31T00:00:00"
  },
  "summary_stats": {
    "historical_avg_temp": 18.5,
    "forecast_avg_temp": 19.2,
    ...
  },
  "forecasts": [
    {
      "date": "2025-01-01T00:00:00",
      "temperature": 22.5,
      "temperature_lower": 20.1,
      "temperature_upper": 24.9
    },
    ...
  ],
  "recommendations": [
    "⚠️ High temperatures expected - plan outdoor activities for early morning",
    ...
  ],
  "model_used": "Prophet"
}
```

## Troubleshooting

### Prophet Installation Issues (Windows)

If Prophet fails to install on Windows, the service will automatically fall back to ARIMA. To use Prophet:

1. Install Microsoft C++ Build Tools from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Or use conda: `conda install -c conda-forge prophet`

### Port Already in Use

If port 8000 is busy:
```cmd
# Windows
uvicorn app:app --reload --port 8001

# Update React app to use http://localhost:8001
```

## Integration with React Frontend

The React app should call this service at `http://localhost:8000/forecast`. CORS is pre-configured for:
- http://localhost:3000
- http://localhost:5173

## Development

To modify forecast parameters:
- Edit `train_prophet_model()` for Prophet settings
- Edit `train_arima_model()` for ARIMA order
- Edit `generate_recommendations()` for custom advice logic

## Notes

- NASA POWER API has rate limits - use reasonable date ranges
- Forecast quality depends on historical data length (recommend 1+ year)
- Prophet works best with daily seasonality patterns
- ARIMA is faster but less accurate for complex patterns
