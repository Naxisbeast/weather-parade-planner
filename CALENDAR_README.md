# Weather Calendar Feature

## Overview

The Weather Calendar is a new feature that provides 30-day weather predictions with AI-powered rainfall forecasts. It combines data from OpenWeather API with custom AI models running on FastAPI to deliver accurate and actionable weather insights.

## Features

### 🗓️ Interactive Calendar
- Visual 30-day calendar with color-coded risk levels
- Click on any date to view detailed weather information
- Smooth animations and hover effects
- Responsive design for mobile and desktop

### 🌦️ Weather Data Sources
1. **OpenWeather One Call API** - Real-time weather data with 8-day forecasts
2. **FastAPI AI Predictions** - 30-day forecasts using Prophet/ARIMA models with rainfall prediction

### 🔔 Daily Notifications
- Enable browser notifications for daily weather updates
- Receive alerts at 7 AM each day
- Smart risk-level notifications (high, moderate, low)

### 📊 Risk Assessment
- **Low Risk** (Green) - Favorable conditions for outdoor activities
- **Moderate Risk** (Yellow) - Caution advised, check details
- **High Risk** (Red) - Severe weather conditions expected

### 📈 AI Rainfall Prediction
The FastAPI backend uses a balanced algorithm considering:
- **Humidity** (50% weight) - Primary indicator
- **Pressure** (30% weight) - Storm system detection
- **Temperature** (20% weight) - Moisture capacity factor

The model has been calibrated to avoid over-prediction and provides realistic rainfall probabilities.

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- OpenWeather API key (free tier available)

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```
   
   Get your free API key at: https://openweathermap.org/api
   
   Note: The One Call API 3.0 requires signing up for a subscription (free tier includes 1,000 calls/day)

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at http://localhost:5173 (or another port if 5173 is busy)

### Backend Setup (FastAPI)

1. **Navigate to the forecast service directory:**
   ```bash
   cd forecast_service
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the FastAPI server:**
   ```bash
   python -m uvicorn app:app --host 0.0.0.0 --port 8000
   ```
   
   Or simply:
   ```bash
   python app.py
   ```
   
   The API will be available at http://localhost:8000

4. **Verify the service is running:**
   ```bash
   curl http://localhost:8000/health
   ```

## Usage Guide

### Accessing the Calendar

1. Navigate to the Calendar page using the navigation menu
2. Or visit directly: http://localhost:5173/calendar

### Getting Weather Predictions

1. **Enter a Location:**
   - Type a city name (e.g., "New York", "London")
   - Or enter coordinates (e.g., "40.7128, -74.0060")

2. **Fetch Weather Data:**
   - Click "Fetch Weather Data" to get OpenWeather predictions (8 days)
   - Click "Get AI Predictions" to generate 30-day AI forecasts

3. **View Details:**
   - Click any date on the calendar to see detailed information
   - View temperature, humidity, pressure, wind speed, and rainfall predictions

4. **Enable Notifications:**
   - Click "Enable Daily Notifications"
   - Grant browser permission when prompted
   - Receive daily weather updates at 7 AM

### Understanding the Data

**Weather Details Card shows:**
- 🌡️ Temperature (current, min, max)
- 💧 Humidity percentage
- 🧭 Atmospheric pressure
- 💨 Wind speed
- 🌧️ Rainfall probability and predicted amount

**30-Day Summary includes:**
- Number of low, moderate, and high-risk days
- Average temperature over 30 days
- Total predicted rainfall
- Forecast period dates

## API Endpoints

### FastAPI Backend

#### GET /health
Check service health and model status

#### POST /predict-rainfall
Predict rainfall based on weather parameters

**Request:**
```json
{
  "temperature": 25,
  "humidity": 80,
  "pressure": 1010
}
```

**Response:**
```json
{
  "rainfall_probability": 0.523,
  "risk_level": "moderate",
  "predicted_rainfall_mm": 3.35,
  "confidence": 0.7
}
```

#### POST /thirty-day-forecast
Generate 30-day weather forecast with AI predictions

**Request:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response:**
```json
{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "predictions": [...],
  "summary": {
    "high_risk_days": 3,
    "moderate_risk_days": 12,
    "low_risk_days": 15,
    "average_temperature": 22.5,
    "total_predicted_rainfall": 45.2
  }
}
```

## Troubleshooting

### "AI Service Offline" message
- Ensure FastAPI server is running on port 8000
- Check the terminal for any error messages
- Verify Python dependencies are installed

### No weather data showing
- Check your OpenWeather API key is correctly set in `.env`
- Ensure you have an active internet connection
- Check browser console for error messages

### Notifications not working
- Ensure browser notifications are enabled in settings
- Check that HTTPS is enabled (required for service workers in production)
- Try the test notification button first

### Calendar tiles not color-coded
- Fetch weather data or AI predictions first
- Ensure location is selected
- Check browser console for errors

## Design Inspiration

The calendar interface is inspired by MSN Weather with:
- Clean, modern card-based layout
- Smooth transitions and animations
- Color-coded visual indicators
- Rounded corners and gradients
- Responsive grid layout

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Note: Notifications require browser support for the Notifications API and Service Workers.

## Future Enhancements

Potential improvements for future versions:
- Historical weather data comparison
- Weather pattern visualization charts
- Multiple location tracking
- Export predictions to calendar apps
- SMS/Email notification options
- Weather-based activity recommendations
- Integration with more weather data sources

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all services are running correctly
3. Review the setup instructions above
4. Check API keys and environment variables

## License

This feature is part of the Weather Parade Planner application. See the main README for license information.
