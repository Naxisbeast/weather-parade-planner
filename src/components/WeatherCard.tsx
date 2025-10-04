import { Card, CardContent } from "@/components/ui/card";
import { WeatherDetail, conditionLabels, conditionIcons } from "@/data/weatherData";
import { WeatherProbabilities } from "@/data/weatherData";

interface WeatherCardProps {
  condition: keyof WeatherProbabilities;
  data: WeatherDetail;
}

const WeatherCard = ({ condition, data }: WeatherCardProps) => {
  const getGradient = (condition: keyof WeatherProbabilities) => {
    switch (condition) {
      case "very_hot":
        return "bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-900";
      case "very_cold":
        return "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-900";
      case "very_windy":
        return "bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-200 dark:border-purple-900";
      case "very_wet":
        return "bg-gradient-to-br from-blue-600/10 to-blue-400/10 border-blue-300 dark:border-blue-800";
      case "very_uncomfortable":
        return "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-200 dark:border-amber-900";
      default:
        return "";
    }
  };

  const getDetails = () => {
    switch (condition) {
      case "very_hot":
      case "very_cold":
        return (
          <div className="flex justify-between text-sm mt-3 pt-3 border-t border-border/50">
            <span className="text-muted-foreground">Avg: {data.avg_temp}°C</span>
            <span className="text-muted-foreground">Max: {data.max_temp}°C</span>
            <span className="text-muted-foreground">Min: {data.min_temp}°C</span>
          </div>
        );
      case "very_windy":
        return (
          <div className="flex justify-between text-sm mt-3 pt-3 border-t border-border/50">
            <span className="text-muted-foreground">Avg: {data.avg_speed} km/h</span>
            <span className="text-muted-foreground">Gusts: {data.gusts} km/h</span>
          </div>
        );
      case "very_wet":
        return (
          <div className="flex justify-between text-sm mt-3 pt-3 border-t border-border/50">
            <span className="text-muted-foreground">Avg: {data.avg_rain_mm}mm</span>
            <span className="text-muted-foreground">Max: {data.max_rain_mm}mm</span>
          </div>
        );
      case "very_uncomfortable":
        return (
          <div className="flex justify-between text-sm mt-3 pt-3 border-t border-border/50">
            <span className="text-muted-foreground">Humidity: {data.humidity}%</span>
            <span className="text-muted-foreground">Heat Index: {data.heat_index}°C</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={`shadow-md transition-all hover:shadow-lg ${getGradient(condition)}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{conditionIcons[condition]}</span>
              <h3 className="text-lg font-semibold">{conditionLabels[condition]}</h3>
            </div>
            <div className="text-4xl font-bold text-primary mb-1">
              {Math.round(data.probability * 100)}%
            </div>
            <p className="text-sm text-muted-foreground">probability</p>
          </div>
        </div>
        {getDetails()}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
