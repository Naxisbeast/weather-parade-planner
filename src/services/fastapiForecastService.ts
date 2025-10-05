export interface FastAPIForecastRequest {
  latitude: number;
  longitude: number;
  start_date: string; // YYYYMMDD format
  end_date: string;   // YYYYMMDD format
  forecast_months?: number;
}

export interface ForecastDataPoint {
  date: string; // ISO datetime
  temperature: number;
  temperature_lower?: number;
  temperature_upper?: number;
  rainfall?: number;
  windspeed?: number;
}

export interface FastAPIForecastResponse {
  location: {
    latitude: number;
    longitude: number;
  };
  historical_period: {
    start: string;
    end: string;
  };
  forecast_period: {
    start: string;
    end: string;
  };
  summary_stats: {
    historical_avg_temp: number;
    historical_max_temp: number;
    historical_min_temp: number;
    historical_avg_rainfall: number;
    historical_total_rainfall: number;
    historical_avg_windspeed: number;
    forecast_avg_temp: number;
    forecast_max_temp: number;
    forecast_min_temp: number;
  };
  forecasts: ForecastDataPoint[];
  recommendations: string[];
  model_used: string;
}

const FASTAPI_BASE_URL = 'http://localhost:8000';

export const callFastAPIForecast = async (
  request: FastAPIForecastRequest
): Promise<FastAPIForecastResponse> => {
  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/forecast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `FastAPI request failed: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error(
          'Cannot connect to forecast service. Make sure FastAPI is running on http://localhost:8000'
        );
      }
      throw error;
    }
    throw new Error('Unknown error occurred while calling forecast service');
  }
};

export const checkFastAPIHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
};

export const formatDateForFastAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

export const exportFastAPIForecastToCSV = (
  response: FastAPIForecastResponse,
  location: string
): string => {
  const headers = 'Date,Temperature (°C),Lower Bound (°C),Upper Bound (°C)';
  const rows = response.forecasts.map(point => {
    const date = new Date(point.date).toISOString().split('T')[0];
    return `${date},${point.temperature.toFixed(2)},${(point.temperature_lower || 0).toFixed(2)},${(point.temperature_upper || 0).toFixed(2)}`;
  }).join('\n');

  const summary = `Location: ${location}
Model: ${response.model_used}
Historical Period: ${response.historical_period.start} to ${response.historical_period.end}
Forecast Period: ${response.forecast_period.start} to ${response.forecast_period.end}

Summary Statistics:
Historical Avg Temp: ${response.summary_stats.historical_avg_temp.toFixed(1)}°C
Forecast Avg Temp: ${response.summary_stats.forecast_avg_temp.toFixed(1)}°C

Recommendations:
${response.recommendations.map(r => `- ${r}`).join('\n')}

`;

  return `${summary}\n${headers}\n${rows}`;
};

export const exportFastAPIForecastToJSON = (
  response: FastAPIForecastResponse,
  location: string
): string => {
  return JSON.stringify(
    {
      location,
      model: response.model_used,
      ...response,
    },
    null,
    2
  );
};
