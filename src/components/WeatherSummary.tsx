import { Card, CardContent } from "@/components/ui/card";
import { WeatherProbabilities, conditionLabels } from "@/data/weatherData";
import { AlertCircle } from "lucide-react";

interface WeatherSummaryProps {
  location: string;
  date: string;
  data: WeatherProbabilities;
  selectedConditions: Set<keyof WeatherProbabilities>;
}

const WeatherSummary = ({ location, date, data, selectedConditions }: WeatherSummaryProps) => {
  if (selectedConditions.size === 0) {
    return null;
  }

  const conditions = Array.from(selectedConditions)
    .map(key => ({
      label: conditionLabels[key],
      probability: Math.round(data[key].probability * 100)
    }))
    .sort((a, b) => b.probability - a.probability);

  const highestRisk = conditions[0];

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-3 flex-1">
            <p className="text-sm text-muted-foreground">
              On <strong className="text-foreground">{date}</strong> in{" "}
              <strong className="text-foreground">{location}</strong>, based on historical data:
            </p>
            
            <ul className="space-y-2">
              {conditions.map(({ label, probability }) => (
                <li key={label} className="text-sm">
                  <span className="font-medium text-foreground">{probability}%</span> chance of{" "}
                  <span className="text-foreground">{label.toLowerCase()}</span> conditions
                </li>
              ))}
            </ul>

            {highestRisk.probability >= 50 && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm font-medium text-destructive">
                  High Risk Alert: {highestRisk.label} conditions are more likely than not on this date.
                </p>
              </div>
            )}

            {highestRisk.probability < 30 && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary">
                  Good Conditions: All selected weather concerns show relatively low probability.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherSummary;
