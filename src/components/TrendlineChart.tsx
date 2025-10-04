import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { WeatherProbabilities, historicalTrends } from "@/data/weatherData";

interface TrendlineChartProps {
  location: string;
  date: string;
  selectedConditions: Set<keyof WeatherProbabilities>;
}

const COLORS: Record<keyof WeatherProbabilities, string> = {
  very_hot: "hsl(0, 84%, 60%)",
  very_cold: "hsl(200, 84%, 60%)",
  very_windy: "hsl(270, 84%, 60%)",
  very_wet: "hsl(217, 91%, 60%)",
  very_uncomfortable: "hsl(30, 84%, 60%)"
};

const TrendlineChart = ({ location, date, selectedConditions }: TrendlineChartProps) => {
  const locationTrends = historicalTrends[location]?.[date];
  
  if (!locationTrends) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No historical data available for this location and date
      </div>
    );
  }

  // Combine all trends into one dataset
  const years = locationTrends.very_hot.map(d => d.year);
  const chartData = years.map((year) => {
    const dataPoint: any = { year };
    
    Object.entries(locationTrends).forEach(([condition, trends]) => {
      if (selectedConditions.has(condition as keyof WeatherProbabilities)) {
        const trend = trends.find(t => t.year === year);
        if (trend) {
          dataPoint[condition] = Math.round(trend.probability * 100);
        }
      }
    });
    
    return dataPoint;
  });

  const conditionLabels: Record<keyof WeatherProbabilities, string> = {
    very_hot: "Very Hot",
    very_cold: "Very Cold",
    very_windy: "Very Windy",
    very_wet: "Very Wet",
    very_uncomfortable: "Very Uncomfortable"
  };

  if (selectedConditions.size === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Select at least one condition to view historical trends
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="year" 
          stroke="hsl(var(--foreground))"
        />
        <YAxis 
          label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
          stroke="hsl(var(--foreground))"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value) => [`${value}%`, '']}
        />
        <Legend />
        {Array.from(selectedConditions).map((condition) => (
          <Line
            key={condition}
            type="monotone"
            dataKey={condition}
            name={conditionLabels[condition]}
            stroke={COLORS[condition]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendlineChart;
