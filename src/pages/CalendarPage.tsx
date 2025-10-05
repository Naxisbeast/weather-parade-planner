import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Cloud, CloudRain, Sun, Wind, Droplets, Gauge, Calendar as CalendarIcon,
  MapPin, Loader2, TrendingUp, AlertTriangle, CheckCircle2
} from "lucide-react";
import { searchLocationByName, parseCoordinates, getLocationDisplay, GeoLocation } from "@/services/geocodingService";
import { fetchOpenWeatherData, processDailyWeatherData, DailyWeatherPrediction, getWeatherColor } from "@/services/openWeatherService";
import { getThirtyDayForecast, DailyPrediction, ThirtyDayForecastResponse, getRiskLevelColor, getRiskLevelBadgeColor } from "@/services/rainfallPredictionService";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [locationInput, setLocationInput] = useState("");
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [weatherData, setWeatherData] = useState<DailyWeatherPrediction[]>([]);
  const [aiPredictions, setAiPredictions] = useState<DailyPrediction[]>([]);
  const [forecastSummary, setForecastSummary] = useState<ThirtyDayForecastResponse['summary'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiServiceAvailable, setAiServiceAvailable] = useState(false);

  // Check if AI service is available
  useEffect(() => {
    const checkAiService = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        if (response.ok) {
          setAiServiceAvailable(true);
        }
      } catch (error) {
        setAiServiceAvailable(false);
      }
    };
    checkAiService();
  }, []);

  const handleLocationSearch = async (input: string) => {
    setLocationInput(input);
    if (input.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const coordinates = parseCoordinates(input);
      if (coordinates) {
        setSearchResults([coordinates]);
        return;
      }

      const results = await searchLocationByName(input);
      setSearchResults(results);
    } catch (error) {
      console.error("Location search error:", error);
      toast.error("Failed to search location");
    }
  };

  const handleLocationSelect = async (location: GeoLocation) => {
    setSelectedLocation(location);
    setLocationInput(getLocationDisplay(location));
    setSearchResults([]);
    
    // Auto-fetch weather data
    await fetchWeatherData(location);
  };

  const fetchWeatherData = async (location: GeoLocation) => {
    setIsLoading(true);
    try {
      const data = await fetchOpenWeatherData(location.latitude, location.longitude);
      const processed = processDailyWeatherData(data);
      setWeatherData(processed);
      toast.success("Weather data loaded successfully!");
    } catch (error) {
      console.error("Weather fetch error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch weather data");
      setWeatherData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAiPredictions = async () => {
    if (!selectedLocation) {
      toast.error("Please select a location first");
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await getThirtyDayForecast({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
      setAiPredictions(response.predictions);
      setForecastSummary(response.summary);
      toast.success("AI predictions generated successfully!");
    } catch (error) {
      console.error("AI prediction error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate AI predictions");
    } finally {
      setIsAiLoading(false);
    }
  };

  const getSelectedDateData = (): DailyWeatherPrediction | DailyPrediction | null => {
    const dateString = selectedDate.toISOString().split('T')[0];
    
    // Try OpenWeather data first
    const openWeatherData = weatherData.find(d => d.dateString === dateString);
    if (openWeatherData) return openWeatherData;
    
    // Fallback to AI predictions
    const aiData = aiPredictions.find(d => d.date === dateString);
    if (aiData) return aiData;
    
    return null;
  };

  const getTileClassName = ({ date }: { date: Date }) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Check OpenWeather data first
    const openWeatherDay = weatherData.find(d => d.dateString === dateString);
    if (openWeatherDay) {
      return getWeatherColor(openWeatherDay.riskLevel);
    }
    
    // Check AI predictions
    const aiDay = aiPredictions.find(d => d.date === dateString);
    if (aiDay) {
      return getRiskLevelColor(aiDay.risk_level);
    }
    
    return '';
  };

  const selectedDateData = getSelectedDateData();
  const isOpenWeatherData = selectedDateData && 'icon' in selectedDateData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            30-Day Weather Calendar
          </h1>
          <p className="text-muted-foreground">
            View color-coded weather predictions and AI-powered rainfall forecasts
          </p>
        </div>

        {/* Location Search */}
        <Card className="mb-6 shadow-xl rounded-2xl border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Select Location
            </CardTitle>
            <CardDescription>
              Search for a city or enter coordinates (e.g., "40.7128, -74.0060")
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  placeholder="Search for a location..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(result)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="font-medium">{getLocationDisplay(result)}</div>
                        <div className="text-sm text-gray-500">
                          {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedLocation && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => fetchWeatherData(selectedLocation)}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading Weather...
                      </>
                    ) : (
                      <>
                        <Cloud className="mr-2 h-4 w-4" />
                        Fetch Weather Data
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={fetchAiPredictions}
                    disabled={isAiLoading || !aiServiceAvailable}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating AI Predictions...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {aiServiceAvailable ? 'Get AI Predictions' : 'AI Service Offline'}
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {!aiServiceAvailable && (
                <p className="text-xs text-muted-foreground text-center">
                  Start FastAPI service on port 8000 to enable AI predictions
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="shadow-xl rounded-2xl border-2 border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                Weather Calendar
              </CardTitle>
              <CardDescription>
                Click on a date to view detailed weather information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="calendar-container">
                <Calendar
                  onChange={(value) => setSelectedDate(value as Date)}
                  value={selectedDate}
                  tileClassName={getTileClassName}
                  className="rounded-xl border-2 border-gray-200 shadow-sm"
                />
              </div>
              
              {/* Legend */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold mb-2 text-sm">Risk Level Legend:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
                    <span>Low Risk - Favorable conditions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-300"></div>
                    <span>Moderate Risk - Caution advised</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
                    <span>High Risk - Severe conditions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          <div className="space-y-6">
            <Card className="shadow-xl rounded-2xl border-2 border-indigo-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-600" />
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <CardDescription>
                  {selectedDateData ? 'Weather details for selected date' : 'No data available for this date'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateData ? (
                  <div className="space-y-4">
                    {/* Risk Level Badge */}
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                        'riskLevel' in selectedDateData 
                          ? getWeatherColor(selectedDateData.riskLevel)
                          : getRiskLevelColor(selectedDateData.risk_level)
                      }`}>
                        {'riskLevel' in selectedDateData 
                          ? selectedDateData.riskLevel.toUpperCase()
                          : selectedDateData.risk_level.toUpperCase()} RISK
                      </div>
                    </div>

                    {/* Weather Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Sun className="h-4 w-4" />
                          Temperature
                        </div>
                        <div className="text-2xl font-bold">
                          {selectedDateData.temperature}°C
                        </div>
                        {isOpenWeatherData && (
                          <div className="text-xs text-gray-500 mt-1">
                            {selectedDateData.minTemp}°C - {selectedDateData.maxTemp}°C
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Droplets className="h-4 w-4" />
                          Humidity
                        </div>
                        <div className="text-2xl font-bold">
                          {selectedDateData.humidity}%
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Gauge className="h-4 w-4" />
                          Pressure
                        </div>
                        <div className="text-2xl font-bold">
                          {selectedDateData.pressure} hPa
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Wind className="h-4 w-4" />
                          Wind Speed
                        </div>
                        <div className="text-2xl font-bold">
                          {'windSpeed' in selectedDateData 
                            ? selectedDateData.windSpeed 
                            : selectedDateData.wind_speed} m/s
                        </div>
                      </div>
                    </div>

                    {/* Rainfall Information */}
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-md">
                      <div className="flex items-center gap-2 mb-3">
                        <CloudRain className="h-5 w-5 text-blue-700" />
                        <h3 className="font-semibold text-blue-900">Rainfall Prediction</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-800">Probability:</span>
                          <span className="font-bold text-blue-900">
                            {isOpenWeatherData 
                              ? `${selectedDateData.precipProbability}%`
                              : `${Math.round(selectedDateData.rainfall_probability * 100)}%`}
                          </span>
                        </div>
                        {!isOpenWeatherData && (
                          <div className="flex justify-between">
                            <span className="text-sm text-blue-800">Predicted Amount:</span>
                            <span className="font-bold text-blue-900">
                              {selectedDateData.predicted_rainfall_mm} mm
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-blue-800">Description:</span>
                          <span className="font-medium text-blue-900">
                            {isOpenWeatherData 
                              ? selectedDateData.description 
                              : selectedDateData.weather_description}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Cloud className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No weather data available for this date</p>
                    <p className="text-sm mt-2">
                      {selectedLocation 
                        ? 'Click "Fetch Weather Data" or "Get AI Predictions" above'
                        : 'Please select a location first'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            {forecastSummary && (
              <Card className="shadow-xl rounded-2xl border-2 border-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    30-Day Forecast Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-700">Low Risk</span>
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                          {forecastSummary.low_risk_days}
                        </div>
                        <div className="text-xs text-green-600">days</div>
                      </div>
                      
                      <div className="text-center p-3 bg-yellow-50 rounded-xl">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-xs text-yellow-700">Moderate</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-700">
                          {forecastSummary.moderate_risk_days}
                        </div>
                        <div className="text-xs text-yellow-600">days</div>
                      </div>
                      
                      <div className="text-center p-3 bg-red-50 rounded-xl">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-xs text-red-700">High Risk</span>
                        </div>
                        <div className="text-2xl font-bold text-red-700">
                          {forecastSummary.high_risk_days}
                        </div>
                        <div className="text-xs text-red-600">days</div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Average Temperature:</span>
                        <span className="font-semibold">{forecastSummary.average_temperature}°C</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Rainfall:</span>
                        <span className="font-semibold">{forecastSummary.total_predicted_rainfall} mm</span>
                      </div>
                      <div className="text-xs text-gray-500 text-center pt-2">
                        {forecastSummary.forecast_period}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .calendar-container .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        
        .react-calendar__tile {
          border-radius: 8px;
          padding: 1rem 0.5rem;
          transition: all 0.2s ease;
        }
        
        .react-calendar__tile:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .react-calendar__tile--active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border: none !important;
        }
        
        .react-calendar__navigation button {
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        
        .react-calendar__navigation button:hover {
          background-color: #f0f0f0;
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;
