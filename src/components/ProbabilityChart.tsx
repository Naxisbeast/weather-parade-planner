import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { WeatherProbabilities, conditionLabels } from "@/data/weatherData";

interface ProbabilityChartProps {
  data: WeatherProbabilities;
  selectedConditions: Set<keyof WeatherProbabilities>;
}

const COLORS: Record<keyof WeatherProbabilities, string> = {
  very_hot: "hsl(0, 84%, 60%)",
  very_cold: "hsl(200, 84%, 60%)",
  very_windy: "hsl(270, 84%, 60%)",
  very_wet: "hsl(217, 91%, 60%)",
  very_uncomfortable: "hsl(30, 84%, 60%)"
};

const ProbabilityChart = ({ data, selectedConditions }: ProbabilityChartProps) => {
  const chartData = Object.entries(data)
    .filter(([key]) => selectedConditions.has(key as keyof WeatherProbabilities))
    .map(([key, value]) => ({
      condition: conditionLabels[key as keyof WeatherProbabilities],
      probability: Math.round(value.probability * 100),
      key: key as keyof WeatherProbabilities
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        Select at least one condition to view probabilities
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="condition" 
          angle={-45}
          textAnchor="end"
          height={80}
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
          formatter={(value) => [`${value}%`, 'Probability']}
        />
        <Bar dataKey="probability" radius={[8, 8, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.condition} fill={COLORS[entry.key]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProbabilityChart;
