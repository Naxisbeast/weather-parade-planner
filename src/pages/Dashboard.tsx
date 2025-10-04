import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { weatherData, locations, dates, conditionLabels, WeatherProbabilities } from "@/data/weatherData";
import ProbabilityChart from "@/components/ProbabilityChart";
import WeatherSummary from "@/components/WeatherSummary";
import LocationMap from "@/components/LocationMap";
import { toast } from "sonner";

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>(locations[0]);
  const [selectedDate, setSelectedDate] = useState<string>(dates[0]);
  const [selectedConditions, setSelectedConditions] = useState<Set<keyof WeatherProbabilities>>(
    new Set(["very_hot", "very_wet"])
  );
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const toggleCondition = (condition: keyof WeatherProbabilities) => {
    const newConditions = new Set(selectedConditions);
    if (newConditions.has(condition)) {
      newConditions.delete(condition);
    } else {
      newConditions.add(condition);
    }
    setSelectedConditions(newConditions);
  };

  const handleAnalyze = () => {
    if (selectedConditions.size === 0) {
      toast.error("Please select at least one condition to analyze");
      return;
    }
    setHasAnalyzed(true);
    toast.success("Analysis complete!");
  };

  const handleDownload = (format: "json" | "csv") => {
    const data = weatherData[selectedLocation][selectedDate];
    const filteredData = Object.entries(data)
      .filter(([key]) => selectedConditions.has(key as keyof WeatherProbabilities))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: Math.round(value * 100) }), {});

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "json") {
      content = JSON.stringify({
        location: selectedLocation,
        date: selectedDate,
        probabilities: filteredData
      }, null, 2);
      filename = `weather-analysis-${selectedLocation.replace(/\s+/g, "-")}-${selectedDate.replace(/\s+/g, "-")}.json`;
      mimeType = "application/json";
    } else {
      const headers = "Location,Date," + Object.keys(filteredData).map(k => conditionLabels[k as keyof WeatherProbabilities]).join(",");
      const values = `${selectedLocation},${selectedDate},` + Object.values(filteredData).join(",");
      content = headers + "\n" + values;
      filename = `weather-analysis-${selectedLocation.replace(/\s+/g, "-")}-${selectedDate.replace(/\s+/g, "-")}.csv`;
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

  const currentData = weatherData[selectedLocation][selectedDate];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Weather Analysis Dashboard
          </h1>
          <p className="text-muted-foreground">
            Select location, date, and conditions to analyze weather probabilities
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Analysis Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dates.map(date => (
                        <SelectItem key={date} value={date}>{date}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Conditions to Analyze</label>
                  {Object.entries(conditionLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={selectedConditions.has(key as keyof WeatherProbabilities)}
                        onCheckedChange={() => toggleCondition(key as keyof WeatherProbabilities)}
                      />
                      <label
                        htmlFor={key}
                        className="text-sm cursor-pointer hover:text-primary transition-colors"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  className="w-full bg-gradient-sky hover:opacity-90 transition-opacity"
                >
                  Analyze Weather
                </Button>
              </CardContent>
            </Card>

            <LocationMap location={selectedLocation} />
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2 space-y-6">
            {hasAnalyzed ? (
              <>
                <Card className="shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Probability Analysis</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload("json")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload("csv")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProbabilityChart 
                      data={currentData} 
                      selectedConditions={selectedConditions}
                    />
                  </CardContent>
                </Card>

                <WeatherSummary
                  location={selectedLocation}
                  date={selectedDate}
                  data={currentData}
                  selectedConditions={selectedConditions}
                />
              </>
            ) : (
              <Card className="shadow-md">
                <CardContent className="py-20">
                  <div className="text-center text-muted-foreground space-y-2">
                    <p className="text-lg font-medium">Ready to analyze</p>
                    <p className="text-sm">
                      Select your parameters and click "Analyze Weather" to view results
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
