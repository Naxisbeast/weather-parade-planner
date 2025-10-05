import { cacheService } from './cacheService';

export interface OpenWeatherDailyData {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  clouds: number;
  pop: number; // Probability of precipitation
  rain?: number;
  uvi: number;
}

export interface OpenWeatherResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  daily: OpenWeatherDailyData[];
}

export interface DailyWeatherPrediction {
  date: Date;
  dateString: string;
  temperature: number;
  minTemp: number;
  maxTemp: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  icon: string;
  precipProbability: number;
  rain: number;
  weatherMain: string;
  riskLevel: 'low' | 'moderate' | 'high';
}

// Note: You'll need to add your OpenWeather API key
// For development, we'll use a placeholder that can be configured via environment variable
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'YOUR_API_KEY_HERE';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';

export const fetchOpenWeatherData = async (
  latitude: number,
  longitude: number
): Promise<OpenWeatherResponse> => {
  // Generate cache key
  const cacheKey = cacheService.generateKey({
    type: 'openweather',
    latitude,
    longitude
  });

  // Check cache first (cache for 30 minutes)
  const cached = cacheService.get<OpenWeatherResponse>(cacheKey);
  if (cached) {
    console.log('Using cached OpenWeather data');
    return cached;
  }

  const url = `${OPENWEATHER_BASE_URL}?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts&units=metric&appid=${OPENWEATHER_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid OpenWeather API key. Please configure VITE_OPENWEATHER_API_KEY in your .env file.');
    }
    throw new Error(`OpenWeather API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Cache the result for 30 minutes
  cacheService.set(cacheKey, data, 30 * 60 * 1000);

  return data;
};

export const processDailyWeatherData = (data: OpenWeatherResponse): DailyWeatherPrediction[] => {
  return data.daily.map(day => {
    const date = new Date(day.dt * 1000);
    const weatherMain = day.weather[0]?.main || 'Clear';
    
    // Calculate risk level based on multiple factors
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    
    if (
      day.pop > 0.7 || 
      (day.rain && day.rain > 10) ||
      day.wind_speed > 15 ||
      day.temp.day > 35 ||
      day.temp.day < 0
    ) {
      riskLevel = 'high';
    } else if (
      day.pop > 0.4 ||
      (day.rain && day.rain > 5) ||
      day.wind_speed > 10 ||
      day.temp.day > 30 ||
      day.temp.day < 5
    ) {
      riskLevel = 'moderate';
    }

    return {
      date,
      dateString: date.toISOString().split('T')[0],
      temperature: Math.round(day.temp.day * 10) / 10,
      minTemp: Math.round(day.temp.min * 10) / 10,
      maxTemp: Math.round(day.temp.max * 10) / 10,
      humidity: day.humidity,
      pressure: day.pressure,
      windSpeed: Math.round(day.wind_speed * 10) / 10,
      description: day.weather[0]?.description || 'Clear sky',
      icon: day.weather[0]?.icon || '01d',
      precipProbability: Math.round(day.pop * 100),
      rain: day.rain || 0,
      weatherMain,
      riskLevel
    };
  });
};

export const getWeatherColor = (riskLevel: 'low' | 'moderate' | 'high'): string => {
  switch (riskLevel) {
    case 'high':
      return 'bg-red-100 border-red-300 text-red-900';
    case 'moderate':
      return 'bg-yellow-100 border-yellow-300 text-yellow-900';
    case 'low':
      return 'bg-green-100 border-green-300 text-green-900';
  }
};

export const getWeatherIcon = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

export const formatWeatherDescription = (description: string): string => {
  return description.charAt(0).toUpperCase() + description.slice(1);
};
