import { fetchNASAWeatherData, formatDateForNASA, ProcessedWeatherData } from './nasaWeatherService';

export interface ForecastPoint {
  date: string;
  temperature: number;
  rainfall: number;
  windspeed: number;
  temperatureConfidence: [number, number]; // [lower, upper] 95% confidence interval
  rainfallConfidence: [number, number];
  windspeedConfidence: [number, number];
}

export interface ForecastResult {
  historicalData: ProcessedWeatherData[];
  forecastData: ForecastPoint[];
  avgTemperature: number;
  avgRainfall: number;
  avgWindspeed: number;
  forecastStartDate: string;
  forecastEndDate: string;
}

interface HistoricalYearData {
  year: number;
  data: ProcessedWeatherData[];
}

/**
 * Fetch historical data for the same calendar period across multiple years
 * @param latitude Location latitude
 * @param longitude Location longitude
 * @param month Target month (1-12)
 * @param dayOfMonth Target day of month
 * @param yearsBack Number of years to fetch (default 10)
 */
export const fetchHistoricalPattern = async (
  latitude: number,
  longitude: number,
  month: number,
  dayOfMonth: number,
  yearsBack = 10
): Promise<HistoricalYearData[]> => {
  const currentYear = new Date().getFullYear();
  const historicalData: HistoricalYearData[] = [];

  for (let i = 1; i <= yearsBack; i++) {
    const year = currentYear - i;
    const targetDate = new Date(year, month - 1, dayOfMonth);
    
    // Fetch a week window around the target date to capture patterns
    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - 3);
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + 3);

    try {
      const nasaData = await fetchNASAWeatherData({
        latitude,
        longitude,
        startDate: formatDateForNASA(startDate),
        endDate: formatDateForNASA(endDate)
      });

      const parameters = nasaData.properties.parameter;
      const temperatures = parameters.T2M || {};
      const rainfall = parameters.PRECTOTCORR || {};
      const windspeed = parameters.WS2M || {};

      const dates = Object.keys(temperatures).sort();
      const processedData: ProcessedWeatherData[] = dates.map(date => ({
        date,
        temperature: temperatures[date] || 0,
        rainfall: rainfall[date] || 0,
        windspeed: windspeed[date] || 0
      }));

      historicalData.push({
        year,
        data: processedData
      });
    } catch (error) {
      console.error(`Error fetching data for year ${year}:`, error);
    }
  }

  return historicalData;
};

/**
 * Calculate moving average with exponential weighting (more recent years weighted higher)
 */
const calculateWeightedAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  // Exponential weighting: more recent data gets higher weight
  let weightedSum = 0;
  let totalWeight = 0;
  
  values.forEach((value, index) => {
    const weight = Math.exp(index / values.length); // Recent data weighted higher
    weightedSum += value * weight;
    totalWeight += weight;
  });
  
  return weightedSum / totalWeight;
};

/**
 * Calculate standard deviation for confidence intervals
 */
const calculateStdDev = (values: number[], mean: number): number => {
  if (values.length <= 1) return 0;
  
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
  return Math.sqrt(variance);
};

/**
 * Generate forecast for the next 12 months based on historical patterns
 */
export const generateForecast = async (
  latitude: number,
  longitude: number,
  startDate: Date,
  monthsAhead = 12
): Promise<ForecastResult> => {
  const month = startDate.getMonth() + 1;
  const dayOfMonth = startDate.getDate();

  // Fetch historical data for the same calendar date across past years
  const historicalYears = await fetchHistoricalPattern(
    latitude,
    longitude,
    month,
    dayOfMonth,
    10 // Use 10 years of historical data
  );

  // Flatten all historical data
  const allHistoricalData: ProcessedWeatherData[] = historicalYears.flatMap(y => y.data);

  // Generate forecast points for next 12 months
  const forecastData: ForecastPoint[] = [];
  const forecastStartDate = new Date(startDate);
  
  for (let monthOffset = 0; monthOffset < monthsAhead; monthOffset++) {
    const forecastDate = new Date(forecastStartDate);
    forecastDate.setMonth(forecastDate.getMonth() + monthOffset);
    
    const targetMonth = forecastDate.getMonth() + 1;
    const targetDay = forecastDate.getDate();

    // Find historical data for this month/day combination
    const historicalForThisDate = historicalYears.map(yearData => {
      // Find the closest date in each year's data
      const targetDateStr = `${yearData.year}${String(targetMonth).padStart(2, '0')}${String(targetDay).padStart(2, '0')}`;
      const match = yearData.data.find(d => d.date === targetDateStr);
      return match || yearData.data[Math.floor(yearData.data.length / 2)]; // Fallback to middle of week
    }).filter(d => d !== null);

    // Extract values for each parameter
    const temps = historicalForThisDate.map(d => d.temperature);
    const rains = historicalForThisDate.map(d => d.rainfall);
    const winds = historicalForThisDate.map(d => d.windspeed);

    // Calculate forecasts using weighted averages
    const forecastTemp = calculateWeightedAverage(temps);
    const forecastRain = calculateWeightedAverage(rains);
    const forecastWind = calculateWeightedAverage(winds);

    // Calculate confidence intervals (95% = mean ± 1.96 * stddev)
    const tempStdDev = calculateStdDev(temps, forecastTemp);
    const rainStdDev = calculateStdDev(rains, forecastRain);
    const windStdDev = calculateStdDev(winds, forecastWind);

    const dateStr = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}-${String(forecastDate.getDate()).padStart(2, '0')}`;
    
    forecastData.push({
      date: dateStr,
      temperature: Math.round(forecastTemp * 10) / 10,
      rainfall: Math.max(0, Math.round(forecastRain * 100) / 100), // Rainfall can't be negative
      windspeed: Math.round(forecastWind * 10) / 10,
      temperatureConfidence: [
        Math.round((forecastTemp - 1.96 * tempStdDev) * 10) / 10,
        Math.round((forecastTemp + 1.96 * tempStdDev) * 10) / 10
      ],
      rainfallConfidence: [
        Math.max(0, Math.round((forecastRain - 1.96 * rainStdDev) * 100) / 100),
        Math.round((forecastRain + 1.96 * rainStdDev) * 100) / 100
      ],
      windspeedConfidence: [
        Math.max(0, Math.round((forecastWind - 1.96 * windStdDev) * 10) / 10),
        Math.round((forecastWind + 1.96 * windStdDev) * 10) / 10
      ]
    });
  }

  // Calculate overall averages for the forecast period
  const avgTemperature = forecastData.reduce((sum, d) => sum + d.temperature, 0) / forecastData.length;
  const avgRainfall = forecastData.reduce((sum, d) => sum + d.rainfall, 0) / forecastData.length;
  const avgWindspeed = forecastData.reduce((sum, d) => sum + d.windspeed, 0) / forecastData.length;

  const forecastEndDate = new Date(forecastStartDate);
  forecastEndDate.setMonth(forecastEndDate.getMonth() + monthsAhead - 1);

  return {
    historicalData: allHistoricalData,
    forecastData,
    avgTemperature: Math.round(avgTemperature * 10) / 10,
    avgRainfall: Math.round(avgRainfall * 100) / 100,
    avgWindspeed: Math.round(avgWindspeed * 10) / 10,
    forecastStartDate: forecastData[0]?.date || '',
    forecastEndDate: forecastData[forecastData.length - 1]?.date || ''
  };
};

/**
 * Export forecast results to CSV format
 */
export const exportForecastToCSV = (forecast: ForecastResult, location: string): string => {
  const headers = 'Date,Temperature (°C),Temp CI Low,Temp CI High,Rainfall (mm),Rain CI Low,Rain CI High,Wind Speed (m/s),Wind CI Low,Wind CI High,Type';
  
  const rows = forecast.forecastData.map(point =>
    `${point.date},${point.temperature},${point.temperatureConfidence[0]},${point.temperatureConfidence[1]},${point.rainfall},${point.rainfallConfidence[0]},${point.rainfallConfidence[1]},${point.windspeed},${point.windspeedConfidence[0]},${point.windspeedConfidence[1]},Forecast`
  ).join('\n');

  return `Location: ${location}\nForecast Period: ${forecast.forecastStartDate} to ${forecast.forecastEndDate}\n${headers}\n${rows}`;
};

/**
 * Export forecast results to JSON format
 */
export const exportForecastToJSON = (forecast: ForecastResult, location: string): string => {
  return JSON.stringify({
    location,
    forecastPeriod: {
      start: forecast.forecastStartDate,
      end: forecast.forecastEndDate
    },
    averages: {
      temperature: forecast.avgTemperature,
      rainfall: forecast.avgRainfall,
      windspeed: forecast.avgWindspeed
    },
    forecast: forecast.forecastData,
    historicalDataPoints: forecast.historicalData.length
  }, null, 2);
};
