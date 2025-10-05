export interface RainfallPredictionRequest {
  temperature: number;
  humidity: number;
  pressure: number;
}

export interface RainfallPredictionResponse {
  rainfall_probability: number;
  risk_level: 'low' | 'moderate' | 'high';
  predicted_rainfall_mm: number;
  confidence: number;
}

export interface DailyPrediction {
  date: string;
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  rainfall_probability: number;
  predicted_rainfall_mm: number;
  risk_level: 'low' | 'moderate' | 'high';
  weather_description: string;
}

export interface ThirtyDayForecastRequest {
  latitude: number;
  longitude: number;
}

export interface ThirtyDayForecastResponse {
  location: {
    latitude: number;
    longitude: number;
  };
  predictions: DailyPrediction[];
  summary: {
    high_risk_days: number;
    moderate_risk_days: number;
    low_risk_days: number;
    average_temperature: number;
    total_predicted_rainfall: number;
    forecast_period: string;
  };
}

const FASTAPI_BASE_URL = 'http://localhost:8000';

export const predictRainfall = async (
  request: RainfallPredictionRequest
): Promise<RainfallPredictionResponse> => {
  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/predict-rainfall`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Rainfall prediction failed: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error(
          'Cannot connect to AI service. Make sure FastAPI is running on http://localhost:8000'
        );
      }
      throw error;
    }
    throw new Error('Rainfall prediction failed');
  }
};

export const getThirtyDayForecast = async (
  request: ThirtyDayForecastRequest
): Promise<ThirtyDayForecastResponse> => {
  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/thirty-day-forecast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `30-day forecast failed: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error(
          'Cannot connect to AI service. Make sure FastAPI is running on http://localhost:8000'
        );
      }
      throw error;
    }
    throw new Error('30-day forecast generation failed');
  }
};

export const getRiskLevelColor = (riskLevel: 'low' | 'moderate' | 'high'): string => {
  switch (riskLevel) {
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'moderate':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-green-600 bg-green-50';
  }
};

export const getRiskLevelBadgeColor = (riskLevel: 'low' | 'moderate' | 'high'): string => {
  switch (riskLevel) {
    case 'high':
      return 'bg-red-500';
    case 'moderate':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
  }
};
