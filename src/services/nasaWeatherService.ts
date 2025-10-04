export interface NASAWeatherParams {
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  parameters?: string[];
}

export interface NASADailyData {
  [parameter: string]: {
    [date: string]: number;
  };
}

export interface NASAWeatherResponse {
  properties: {
    parameter: NASADailyData;
  };
}

export interface ProcessedWeatherData {
  date: string;
  temperature: number;
  rainfall: number;
  windspeed: number;
}

export interface WeatherStats {
  avgTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  avgRainfall: number;
  maxRainfall: number;
  totalRainfall: number;
  avgWindspeed: number;
  maxWindspeed: number;
  dailyData: ProcessedWeatherData[];
}

export interface RiskLevel {
  level: 'High' | 'Moderate' | 'Low';
  reasons: string[];
}

const NASA_API_BASE = 'https://power.larc.nasa.gov/api/temporal/daily/point';
const DEFAULT_PARAMETERS = ['T2M', 'PRECTOTCORR', 'WS2M'];

export const fetchNASAWeatherData = async (
  params: NASAWeatherParams
): Promise<NASAWeatherResponse> => {
  const {
    latitude,
    longitude,
    startDate,
    endDate,
    parameters = DEFAULT_PARAMETERS
  } = params;

  const url = `${NASA_API_BASE}?parameters=${parameters.join(',')}&start=${startDate}&end=${endDate}&latitude=${latitude}&longitude=${longitude}&format=JSON&community=AG`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`NASA API request failed: ${response.statusText}`);
  }

  return response.json();
};

export const processWeatherData = (nasaData: NASAWeatherResponse): WeatherStats => {
  const parameters = nasaData.properties.parameter;
  const temperatures = parameters.T2M || {};
  const rainfall = parameters.PRECTOTCORR || {};
  const windspeed = parameters.WS2M || {};

  const dates = Object.keys(temperatures);
  const dailyData: ProcessedWeatherData[] = dates.map(date => ({
    date,
    temperature: temperatures[date] || 0,
    rainfall: rainfall[date] || 0,
    windspeed: windspeed[date] || 0
  }));

  const tempValues = Object.values(temperatures);
  const rainValues = Object.values(rainfall);
  const windValues = Object.values(windspeed);

  const avgTemperature = tempValues.reduce((a, b) => a + b, 0) / tempValues.length;
  const maxTemperature = Math.max(...tempValues);
  const minTemperature = Math.min(...tempValues);

  const avgRainfall = rainValues.reduce((a, b) => a + b, 0) / rainValues.length;
  const maxRainfall = Math.max(...rainValues);
  const totalRainfall = rainValues.reduce((a, b) => a + b, 0);

  const avgWindspeed = windValues.reduce((a, b) => a + b, 0) / windValues.length;
  const maxWindspeed = Math.max(...windValues);

  return {
    avgTemperature: Math.round(avgTemperature * 10) / 10,
    maxTemperature: Math.round(maxTemperature * 10) / 10,
    minTemperature: Math.round(minTemperature * 10) / 10,
    avgRainfall: Math.round(avgRainfall * 100) / 100,
    maxRainfall: Math.round(maxRainfall * 100) / 100,
    totalRainfall: Math.round(totalRainfall * 100) / 100,
    avgWindspeed: Math.round(avgWindspeed * 10) / 10,
    maxWindspeed: Math.round(maxWindspeed * 10) / 10,
    dailyData
  };
};

export const calculateRiskLevel = (stats: WeatherStats): RiskLevel => {
  const reasons: string[] = [];

  if (stats.maxRainfall > 20) {
    reasons.push(`Heavy rainfall detected (${stats.maxRainfall}mm)`);
  }

  if (stats.maxWindspeed > 15) {
    reasons.push(`Strong winds detected (${stats.maxWindspeed} m/s)`);
  }

  if (stats.maxTemperature > 35) {
    reasons.push(`Extreme heat detected (${stats.maxTemperature}°C)`);
  }

  if (stats.minTemperature < 5) {
    reasons.push(`Extreme cold detected (${stats.minTemperature}°C)`);
  }

  if (reasons.length > 0) {
    return { level: 'High', reasons };
  }

  if (stats.maxRainfall > 10) {
    reasons.push(`Moderate rainfall (${stats.maxRainfall}mm)`);
  }

  if (stats.maxWindspeed > 8) {
    reasons.push(`Moderate winds (${stats.maxWindspeed} m/s)`);
  }

  if (reasons.length > 0) {
    return { level: 'Moderate', reasons };
  }

  return {
    level: 'Low',
    reasons: ['All weather conditions within normal ranges']
  };
};

export const formatDateForNASA = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

export const exportToCSV = (stats: WeatherStats, location: string): string => {
  const headers = 'Date,Temperature (°C),Rainfall (mm),Wind Speed (m/s)';
  const rows = stats.dailyData.map(day =>
    `${day.date},${day.temperature},${day.rainfall},${day.windspeed}`
  ).join('\n');

  return `Location: ${location}\n${headers}\n${rows}`;
};

export const exportToJSON = (stats: WeatherStats, location: string): string => {
  return JSON.stringify({
    location,
    summary: {
      avgTemperature: stats.avgTemperature,
      maxTemperature: stats.maxTemperature,
      minTemperature: stats.minTemperature,
      avgRainfall: stats.avgRainfall,
      maxRainfall: stats.maxRainfall,
      totalRainfall: stats.totalRainfall,
      avgWindspeed: stats.avgWindspeed,
      maxWindspeed: stats.maxWindspeed
    },
    dailyData: stats.dailyData
  }, null, 2);
};
