import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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
import TrendlineChart from "@/components/TrendlineChart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [locationInput, setLocationInput] = useState("");
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [weatherStats, setWeatherStats] = useState<WeatherStats | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);

  useEffect(() => {
    const today = new Date();
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(today.getDate() - 10);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(tenDaysAgo.toISOString().split('T')[0]);
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

      toast.success("Weather data fetched successfully!");
    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast.error("Failed to fetch weather data. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
            Real-time weather data from NASA POWER API
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
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {weatherStats && riskLevel ? (
              <>
                <Card className={`shadow-md border-2 ${getRiskColor(riskLevel.level)}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Risk Assessment</span>
                      <span className="text-2xl font-bold">{riskLevel.level}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {riskLevel.reasons.map((reason, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Temperature</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average:</span>
                          <span className="font-semibold">{weatherStats.avgTemperature}°C</span>
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

                  <Card className="shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Rainfall</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average:</span>
                          <span className="font-semibold">{weatherStats.avgRainfall} mm</span>
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

                  <Card className="shadow-md">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Wind Speed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Average:</span>
                          <span className="font-semibold">{weatherStats.avgWindspeed} m/s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Max:</span>
                          <span className="font-semibold text-orange-600">{weatherStats.maxWindspeed} m/s</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Temperature Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weatherStats.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#ef4444"
                          strokeWidth={2}
                          name="Temperature (°C)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Rainfall & Wind Speed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weatherStats.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="rainfall"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Rainfall (mm)"
                        />
                        <Line
                          type="monotone"
                          dataKey="windspeed"
                          stroke="#f97316"
                          strokeWidth={2}
                          name="Wind Speed (m/s)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
