import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, MapPin, Loader as Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchNASAWeatherData,
  processWeatherData,
  calculateRiskLevel,
  formatDateForNASA,
  exportToCSV,
  exportToJSON,
  WeatherStats,
  RiskLevel
} from "@/services/nasaWeatherService";
import {
  searchLocationByName,
  parseCoordinates,
  getLocationDisplay,
  GeoLocation
} from "@/services/geocodingService";
import { generatePersonalizedRecommendations, PersonalizedRecommendations } from "@/services/recommendationsService";
import { searchNearbyPlaces, PlaceResult } from "@/services/placesService";
import { generateForecast, exportForecastToCSV, exportForecastToJSON, ForecastResult } from "@/services/forecastService";
import {
  callFastAPIForecast,
  checkFastAPIHealth,
  formatDateForFastAPI,
  exportFastAPIForecastToCSV,
  exportFastAPIForecastToJSON,
  FastAPIForecastResponse
} from "@/services/fastapiForecastService";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, TooltipProps } from "recharts";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [locationInput, setLocationInput] = useState("");
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [weatherStats, setWeatherStats] = useState<WeatherStats | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceResult[]>([]);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [fastapiForecast, setFastapiForecast] = useState<FastAPIForecastResponse | null>(null);
  const [isFastapiLoading, setIsFastapiLoading] = useState(false);
  const [fastapiServiceAvailable, setFastapiServiceAvailable] = useState(false);

  useEffect(() => {
    const today = new Date();
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(today.getDate() - 10);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(tenDaysAgo.toISOString().split('T')[0]);

    // Check if FastAPI service is available
    checkFastAPIHealth().then(setFastapiServiceAvailable);
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (locationInput.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      const coords = parseCoordinates(locationInput);
      if (coords) {
        setSearchResults([coords]);
        return;
      }

      setIsSearching(true);
      const results = await searchLocationByName(locationInput);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [locationInput]);

  const handleLocationSelect = (location: GeoLocation) => {
    setSelectedLocation(location);
    setLocationInput(getLocationDisplay(location));
    setSearchResults([]);
  };

  const handleAnalyze = async () => {
    if (!selectedLocation) {
      toast.error("Please select a location");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select date range");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast.error("Start date must be before end date");
      return;
    }

    setIsLoading(true);

    try {
      const nasaStartDate = formatDateForNASA(start);
      const nasaEndDate = formatDateForNASA(end);

      const nasaData = await fetchNASAWeatherData({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        startDate: nasaStartDate,
        endDate: nasaEndDate
      });

      const stats = processWeatherData(nasaData);
      const risk = calculateRiskLevel(stats);

      setWeatherStats(stats);
      setRiskLevel(risk);

      const personalizedRecs = generatePersonalizedRecommendations(stats);
      setRecommendations(personalizedRecs);

      // Save to history if authenticated
      if (isAuthenticated && user) {
        try {
          await supabase.from('weather_searches').insert({
            user_id: user.id,
            location_name: selectedLocation.name,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            start_date: startDate,
            end_date: endDate,
            avg_temperature: stats.avgTemperature,
            max_temperature: stats.maxTemperature,
            min_temperature: stats.minTemperature,
            avg_rainfall: stats.avgRainfall,
            max_rainfall: stats.maxRainfall,
            avg_windspeed: stats.avgWindspeed,
            max_windspeed: stats.maxWindspeed,
            risk_level: risk.level
          });
        } catch (error) {
          console.error('Error saving search:', error);
        }
      }

      toast.success("Weather data fetched successfully!");
    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast.error("Failed to fetch weather data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForecast = async () => {
    if (!selectedLocation) {
      toast.error("Please select a location");
      return;
    }

    if (!startDate) {
      toast.error("Please select a start date for the forecast");
      return;
    }

    setIsForecastLoading(true);

    try {
      const start = new Date(startDate);
      const forecast = await generateForecast(
        selectedLocation.latitude,
        selectedLocation.longitude,
        start,
        12 // Generate 12-month forecast
      );

      setForecastResult(forecast);
      toast.success("Forecast generated successfully!");
    } catch (error) {
      console.error("Error generating forecast:", error);
      toast.error("Failed to generate forecast. Please try again.");
    } finally {
      setIsForecastLoading(false);
    }
  };

  const handleFastAPIForecast = async () => {
    if (!selectedLocation) {
      toast.error("Please select a location");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select date range");
      return;
    }

    setIsFastapiLoading(true);
    setFastapiForecast(null);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const response = await callFastAPIForecast({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        start_date: formatDateForFastAPI(start),
        end_date: formatDateForFastAPI(end),
        forecast_months: 12
      });

      setFastapiForecast(response);
      toast.success(`AI Forecast generated using ${response.model_used}!`);
    } catch (error) {
      console.error("Error calling FastAPI forecast:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate AI forecast";
      
      if (errorMessage.includes("Cannot connect to forecast service")) {
        toast.error("FastAPI service is offline. Please start the service on port 8000.");
        setFastapiServiceAvailable(false);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsFastapiLoading(false);
    }
  };

  const handleDownloadForecast = (format: "json" | "csv") => {
    if (!forecastResult || !selectedLocation) {
      toast.error("No forecast data to export");
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "json") {
      content = exportForecastToJSON(forecastResult, getLocationDisplay(selectedLocation));
      filename = `weather-forecast-${selectedLocation.name.replace(/\s+/g, "-")}-${startDate}.json`;
      mimeType = "application/json";
    } else {
      content = exportForecastToCSV(forecastResult, getLocationDisplay(selectedLocation));
      filename = `weather-forecast-${selectedLocation.name.replace(/\s+/g, "-")}-${startDate}.csv`;
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded forecast ${format.toUpperCase()} file`);
  };

  const handleDownloadFastAPIForecast = (format: "json" | "csv") => {
    if (!fastapiForecast || !selectedLocation) {
      toast.error("No AI forecast data to export");
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "json") {
      content = exportFastAPIForecastToJSON(fastapiForecast, getLocationDisplay(selectedLocation));
      filename = `ai-forecast-${selectedLocation.name.replace(/\s+/g, "-")}-${startDate}.json`;
      mimeType = "application/json";
    } else {
      content = exportFastAPIForecastToCSV(fastapiForecast, getLocationDisplay(selectedLocation));
      filename = `ai-forecast-${selectedLocation.name.replace(/\s+/g, "-")}-${startDate}.csv`;
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded AI forecast ${format.toUpperCase()} file`);
  };

  const handleDownload = (format: "json" | "csv") => {
    if (!weatherStats || !selectedLocation) {
      toast.error("No data to export");
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "json") {
      content = exportToJSON(weatherStats, getLocationDisplay(selectedLocation));
      filename = `weather-data-${selectedLocation.name.replace(/\s+/g, "-")}-${startDate}.json`;
      mimeType = "application/json";
    } else {
      content = exportToCSV(weatherStats, getLocationDisplay(selectedLocation));
      filename = `weather-data-${selectedLocation.name.replace(/\s+/g, "-")}-${startDate}.csv`;
      mimeType = "text/csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${format.toUpperCase()} file`);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
      case 'Moderate': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800';
      case 'Low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-2">
            NASA Weather Analysis Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time weather data with personalized recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Search Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    City name or Coordinates (lat, lon)
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="e.g., London or -33.9249, 18.4241"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      className="pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Search className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="border rounded-md bg-background shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleLocationSelect(result)}
                          className="w-full text-left px-4 py-2 hover:bg-accent transition-colors flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">{getLocationDisplay(result)}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedLocation && (
                    <div className="text-sm text-muted-foreground">
                      Selected: {getLocationDisplay(selectedLocation)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate || undefined}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || undefined}
                  />
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading || !selectedLocation}
                  className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:opacity-90 transition-opacity"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching Data...
                    </>
                  ) : (
                    "Analyze Weather"
                  )}
                </Button>

                <Button
                  onClick={handleForecast}
                  disabled={isForecastLoading || !selectedLocation}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  {isForecastLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Forecast...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate 12-Month Forecast
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleFastAPIForecast}
                  disabled={isFastapiLoading || !selectedLocation || !fastapiServiceAvailable}
                  variant="default"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90"
                >
                  {isFastapiLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running AI Forecast...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {fastapiServiceAvailable ? 'Run AI Forecast (Prophet/ARIMA)' : 'AI Service Offline'}
                    </>
                  )}
                </Button>
                {!fastapiServiceAvailable && (
                  <p className="text-xs text-muted-foreground text-center">
                    Start FastAPI service on port 8000 to enable AI forecasting
                  </p>
                )}

                {weatherStats && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload("json")}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload("csv")}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                )}

                {forecastResult && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadForecast("json")}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Forecast JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadForecast("csv")}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Forecast CSV
                    </Button>
                  </div>
                )}

                {fastapiForecast && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFastAPIForecast("json")}
                      className="flex-1 border-purple-600 text-purple-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      AI JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFastAPIForecast("csv")}
                      className="flex-1 border-purple-600 text-purple-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      AI CSV
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {weatherStats && riskLevel ? (
              <>
                <Card className={`shadow-lg rounded-2xl border-2 ${getRiskColor(riskLevel.level)} hover:shadow-xl transition-shadow`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Risk Assessment</span>
                      <span className="text-2xl font-bold">{riskLevel.level}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {riskLevel.reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2 p-2 bg-white/50 backdrop-blur-sm rounded-lg">
                          <span className="mt-1 font-bold">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                      🕐 Last Updated: {new Date().toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-lg rounded-2xl border-none bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 hover:shadow-xl transition-all hover:scale-105">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-2xl">🌡️</span>
                        Temperature
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average:</span>
                          <span className="font-bold text-lg">{weatherStats.avgTemperature}°C</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Max:</span>
                          <span className="font-semibold text-red-600">{weatherStats.maxTemperature}°C</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Min:</span>
                          <span className="font-semibold text-blue-600">{weatherStats.minTemperature}°C</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg rounded-2xl border-none bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 hover:shadow-xl transition-all hover:scale-105">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-2xl">💧</span>
                        Rainfall
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average:</span>
                          <span className="font-bold text-lg">{weatherStats.avgRainfall} mm</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Max:</span>
                          <span className="font-semibold text-blue-600">{weatherStats.maxRainfall} mm</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-semibold">{weatherStats.totalRainfall} mm</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg rounded-2xl border-none bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 hover:shadow-xl transition-all hover:scale-105">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-2xl">💨</span>
                        Wind Speed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average:</span>
                          <span className="font-bold text-lg">{weatherStats.avgWindspeed} m/s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Max:</span>
                          <span className="font-semibold text-orange-600">{weatherStats.maxWindspeed} m/s</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {recommendations && (
                  <RecommendationsPanel
                    recommendations={recommendations}
                    nearbyPlaces={nearbyPlaces}
                    isIndividual={true}
                  />
                )}

                <Card className="shadow-lg rounded-2xl border-none bg-gradient-to-br from-red-50/50 to-orange-50/50 hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm">🌡️</div>
                      Temperature Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={weatherStats.dailyData}>
                        <defs>
                          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <YAxis 
                          label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                          stroke="#6b7280"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="temperature"
                          stroke="#ef4444"
                          strokeWidth={3}
                          fill="url(#tempGradient)"
                          name="Temperature (°C)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-lg rounded-2xl border-none bg-gradient-to-br from-blue-50/50 to-cyan-50/50 hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm">💧</div>
                      Rainfall & Wind Speed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={weatherStats.dailyData}>
                        <defs>
                          <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          stroke="#6b7280"
                        />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="rainfall"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fill="url(#rainGradient)"
                          name="Rainfall (mm)"
                        />
                        <Area
                          type="monotone"
                          dataKey="windspeed"
                          stroke="#f97316"
                          strokeWidth={3}
                          fill="url(#windGradient)"
                          name="Wind Speed (m/s)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : isLoading ? (
              <div className="space-y-6">
                <Card className="shadow-md">
                  <CardContent className="py-8">
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-8 bg-muted rounded w-1/2"></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-16 bg-muted rounded"></div>
                        <div className="h-16 bg-muted rounded"></div>
                        <div className="h-16 bg-muted rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-md">
                  <CardContent className="py-8">
                    <div className="h-64 bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="shadow-md">
                <CardContent className="py-20">
                  <div className="text-center text-muted-foreground space-y-2">
                    <p className="text-lg font-medium">Ready to analyze</p>
                    <p className="text-sm">
                      Select a location and date range, then click "Analyze Weather"
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {forecastResult && (
              <>
                <Card className="shadow-md border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      12-Month Weather Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Avg Temperature</div>
                        <div className="text-2xl font-bold text-red-600">
                          {forecastResult.avgTemperature}°C
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Avg Rainfall</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {forecastResult.avgRainfall} mm
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Avg Wind Speed</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {forecastResult.avgWindspeed} m/s
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Forecast period: {forecastResult.forecastStartDate} to {forecastResult.forecastEndDate}
                      <br />
                      Based on {forecastResult.historicalData.length} historical data points
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg rounded-2xl border-none bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      Temperature Forecast (with Confidence Band)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={forecastResult.forecastData}>
                        <defs>
                          <linearGradient id="forecastTempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          stroke="#6b7280"
                        />
                        <YAxis 
                          label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                          stroke="#6b7280"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="temperatureConfidence"
                          fill="#93c5fd"
                          stroke="none"
                          fillOpacity={0.3}
                          name="Confidence Band"
                        />
                        <Area
                          type="monotone"
                          dataKey="temperature"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fill="url(#forecastTempGradient)"
                          name="Predicted Temperature (°C)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-blue-200">
                  <CardHeader>
                    <CardTitle>Rainfall & Wind Speed Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={forecastResult.forecastData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="rainfall"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Predicted Rainfall (mm)"
                        />
                        <Line
                          type="monotone"
                          dataKey="windspeed"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          name="Predicted Wind Speed (m/s)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}

            {fastapiForecast && (
              <>
                <Card className="shadow-lg rounded-2xl border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      AI Weather Forecast ({fastapiForecast.model_used})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm">
                        <div className="text-sm text-muted-foreground">Historical Avg</div>
                        <div className="text-2xl font-bold">
                          {fastapiForecast.summary_stats.historical_avg_temp.toFixed(1)}°C
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm">
                        <div className="text-sm text-muted-foreground">Forecast Avg</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {fastapiForecast.summary_stats.forecast_avg_temp.toFixed(1)}°C
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm">
                        <div className="text-sm text-muted-foreground">Max Temp</div>
                        <div className="text-2xl font-bold text-red-600">
                          {fastapiForecast.summary_stats.forecast_max_temp.toFixed(1)}°C
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
                      <div>📅 Historical: {new Date(fastapiForecast.historical_period.start).toLocaleDateString()} - {new Date(fastapiForecast.historical_period.end).toLocaleDateString()}</div>
                      <div>🔮 Forecast: {new Date(fastapiForecast.forecast_period.start).toLocaleDateString()} - {new Date(fastapiForecast.forecast_period.end).toLocaleDateString()}</div>
                      <div>🕐 Last Updated: {new Date().toLocaleString()}</div>
                    </div>
                  </CardContent>
                </Card>

                {fastapiForecast.recommendations.length > 0 && (
                  <Card className="shadow-lg rounded-2xl border-none bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">💡</span>
                        AI-Generated Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {fastapiForecast.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm p-3 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
                            <span className="mt-0.5 text-purple-600 font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card className="shadow-lg rounded-2xl border-none bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">📈</span>
                      Temperature Forecast with Confidence Bands
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={fastapiForecast.forecasts.map(f => ({
                        date: new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        temp: f.temperature,
                        lower: f.temperature_lower || f.temperature,
                        upper: f.temperature_upper || f.temperature
                      }))}>
                        <defs>
                          <linearGradient id="aiForecastGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11 }}
                          interval={Math.floor(fastapiForecast.forecasts.length / 12)}
                          stroke="#6b7280"
                        />
                        <YAxis 
                          label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
                          stroke="#6b7280"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="upper"
                          fill="#c084fc"
                          stroke="none"
                          fillOpacity={0.3}
                          name="Upper Bound"
                        />
                        <Area
                          type="monotone"
                          dataKey="lower"
                          fill="#ffffff"
                          stroke="none"
                          fillOpacity={1}
                          name="Lower Bound"
                        />
                        <Area
                          type="monotone"
                          dataKey="temp"
                          stroke="#9333ea"
                          strokeWidth={3}
                          fill="url(#aiForecastGradient)"
                          name="Temperature (°C)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-purple-200">
                  <CardHeader>
                    <CardTitle>Statistics Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-medium text-muted-foreground">Historical Period</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Avg Temp:</span>
                            <span className="font-semibold">{fastapiForecast.summary_stats.historical_avg_temp.toFixed(1)}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Temp:</span>
                            <span className="font-semibold">{fastapiForecast.summary_stats.historical_max_temp.toFixed(1)}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Min Temp:</span>
                            <span className="font-semibold">{fastapiForecast.summary_stats.historical_min_temp.toFixed(1)}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Rainfall:</span>
                            <span className="font-semibold">{fastapiForecast.summary_stats.historical_avg_rainfall.toFixed(2)} mm</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-muted-foreground">Forecast Period</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Avg Temp:</span>
                            <span className="font-semibold text-purple-600">{fastapiForecast.summary_stats.forecast_avg_temp.toFixed(1)}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Temp:</span>
                            <span className="font-semibold text-purple-600">{fastapiForecast.summary_stats.forecast_max_temp.toFixed(1)}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Min Temp:</span>
                            <span className="font-semibold text-purple-600">{fastapiForecast.summary_stats.forecast_min_temp.toFixed(1)}°C</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
