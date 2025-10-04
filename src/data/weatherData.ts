export interface WeatherDetail {
  probability: number;
  avg_temp?: number;
  max_temp?: number;
  min_temp?: number;
  avg_speed?: number;
  gusts?: number;
  avg_rain_mm?: number;
  max_rain_mm?: number;
  humidity?: number;
  heat_index?: number;
}

export interface WeatherProbabilities {
  very_hot: WeatherDetail;
  very_cold: WeatherDetail;
  very_windy: WeatherDetail;
  very_wet: WeatherDetail;
  very_uncomfortable: WeatherDetail;
}

export interface LocationData {
  [date: string]: WeatherProbabilities;
}

export interface WeatherData {
  [location: string]: LocationData;
}

export interface HistoricalTrend {
  year: number;
  probability: number;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export const locationCoordinates: Record<string, LocationCoordinates> = {
  "Cape Town": { lat: -33.9249, lng: 18.4241 },
  "Johannesburg": { lat: -26.2041, lng: 28.0473 },
  "Durban": { lat: -29.8587, lng: 31.0218 }
};

export const weatherData: WeatherData = {
  "Cape Town": {
    "Jan 10": {
      very_hot: { 
        probability: 0.65, 
        avg_temp: 32, 
        max_temp: 38, 
        min_temp: 27 
      },
      very_cold: { 
        probability: 0.05, 
        avg_temp: 12, 
        min_temp: 5, 
        max_temp: 15 
      },
      very_windy: { 
        probability: 0.40, 
        avg_speed: 28, 
        gusts: 45 
      },
      very_wet: { 
        probability: 0.25, 
        avg_rain_mm: 12, 
        max_rain_mm: 30 
      },
      very_uncomfortable: { 
        probability: 0.30, 
        humidity: 72, 
        heat_index: 36 
      }
    },
    "Dec 16": {
      very_hot: { 
        probability: 0.55, 
        avg_temp: 30, 
        max_temp: 36, 
        min_temp: 24 
      },
      very_cold: { 
        probability: 0.10, 
        avg_temp: 14, 
        min_temp: 8, 
        max_temp: 18 
      },
      very_windy: { 
        probability: 0.35, 
        avg_speed: 25, 
        gusts: 40 
      },
      very_wet: { 
        probability: 0.50, 
        avg_rain_mm: 18, 
        max_rain_mm: 45 
      },
      very_uncomfortable: { 
        probability: 0.45, 
        humidity: 78, 
        heat_index: 34 
      }
    }
  },
  "Johannesburg": {
    "Jan 10": {
      very_hot: { 
        probability: 0.45, 
        avg_temp: 28, 
        max_temp: 34, 
        min_temp: 22 
      },
      very_cold: { 
        probability: 0.15, 
        avg_temp: 10, 
        min_temp: 3, 
        max_temp: 16 
      },
      very_windy: { 
        probability: 0.20, 
        avg_speed: 20, 
        gusts: 35 
      },
      very_wet: { 
        probability: 0.60, 
        avg_rain_mm: 22, 
        max_rain_mm: 55 
      },
      very_uncomfortable: { 
        probability: 0.50, 
        humidity: 68, 
        heat_index: 32 
      }
    },
    "Dec 16": {
      very_hot: { 
        probability: 0.35, 
        avg_temp: 26, 
        max_temp: 32, 
        min_temp: 20 
      },
      very_cold: { 
        probability: 0.20, 
        avg_temp: 8, 
        min_temp: 2, 
        max_temp: 14 
      },
      very_windy: { 
        probability: 0.25, 
        avg_speed: 22, 
        gusts: 38 
      },
      very_wet: { 
        probability: 0.70, 
        avg_rain_mm: 28, 
        max_rain_mm: 65 
      },
      very_uncomfortable: { 
        probability: 0.55, 
        humidity: 75, 
        heat_index: 30 
      }
    }
  },
  "Durban": {
    "Jan 10": {
      very_hot: { 
        probability: 0.75, 
        avg_temp: 34, 
        max_temp: 40, 
        min_temp: 28 
      },
      very_cold: { 
        probability: 0.02, 
        avg_temp: 16, 
        min_temp: 10, 
        max_temp: 20 
      },
      very_windy: { 
        probability: 0.30, 
        avg_speed: 24, 
        gusts: 42 
      },
      very_wet: { 
        probability: 0.40, 
        avg_rain_mm: 15, 
        max_rain_mm: 38 
      },
      very_uncomfortable: { 
        probability: 0.65, 
        humidity: 82, 
        heat_index: 38 
      }
    },
    "Dec 16": {
      very_hot: { 
        probability: 0.80, 
        avg_temp: 36, 
        max_temp: 42, 
        min_temp: 30 
      },
      very_cold: { 
        probability: 0.01, 
        avg_temp: 18, 
        min_temp: 12, 
        max_temp: 22 
      },
      very_windy: { 
        probability: 0.35, 
        avg_speed: 26, 
        gusts: 44 
      },
      very_wet: { 
        probability: 0.50, 
        avg_rain_mm: 20, 
        max_rain_mm: 48 
      },
      very_uncomfortable: { 
        probability: 0.70, 
        humidity: 85, 
        heat_index: 40 
      }
    }
  }
};

// Historical trend data (dummy - last 10 years)
export const historicalTrends: Record<string, Record<string, Record<keyof WeatherProbabilities, HistoricalTrend[]>>> = {
  "Cape Town": {
    "Jan 10": {
      very_hot: [
        { year: 2015, probability: 0.58 },
        { year: 2016, probability: 0.62 },
        { year: 2017, probability: 0.60 },
        { year: 2018, probability: 0.63 },
        { year: 2019, probability: 0.64 },
        { year: 2020, probability: 0.66 },
        { year: 2021, probability: 0.65 },
        { year: 2022, probability: 0.67 },
        { year: 2023, probability: 0.64 },
        { year: 2024, probability: 0.65 }
      ],
      very_wet: [
        { year: 2015, probability: 0.28 },
        { year: 2016, probability: 0.24 },
        { year: 2017, probability: 0.26 },
        { year: 2018, probability: 0.23 },
        { year: 2019, probability: 0.25 },
        { year: 2020, probability: 0.27 },
        { year: 2021, probability: 0.24 },
        { year: 2022, probability: 0.26 },
        { year: 2023, probability: 0.25 },
        { year: 2024, probability: 0.25 }
      ],
      very_windy: [
        { year: 2015, probability: 0.38 },
        { year: 2016, probability: 0.42 },
        { year: 2017, probability: 0.39 },
        { year: 2018, probability: 0.41 },
        { year: 2019, probability: 0.40 },
        { year: 2020, probability: 0.43 },
        { year: 2021, probability: 0.39 },
        { year: 2022, probability: 0.41 },
        { year: 2023, probability: 0.40 },
        { year: 2024, probability: 0.40 }
      ],
      very_cold: [
        { year: 2015, probability: 0.06 },
        { year: 2016, probability: 0.05 },
        { year: 2017, probability: 0.05 },
        { year: 2018, probability: 0.04 },
        { year: 2019, probability: 0.05 },
        { year: 2020, probability: 0.05 },
        { year: 2021, probability: 0.06 },
        { year: 2022, probability: 0.04 },
        { year: 2023, probability: 0.05 },
        { year: 2024, probability: 0.05 }
      ],
      very_uncomfortable: [
        { year: 2015, probability: 0.28 },
        { year: 2016, probability: 0.32 },
        { year: 2017, probability: 0.29 },
        { year: 2018, probability: 0.31 },
        { year: 2019, probability: 0.30 },
        { year: 2020, probability: 0.32 },
        { year: 2021, probability: 0.29 },
        { year: 2022, probability: 0.31 },
        { year: 2023, probability: 0.30 },
        { year: 2024, probability: 0.30 }
      ]
    },
    "Dec 16": {
      very_hot: [
        { year: 2015, probability: 0.52 },
        { year: 2016, probability: 0.56 },
        { year: 2017, probability: 0.54 },
        { year: 2018, probability: 0.57 },
        { year: 2019, probability: 0.55 },
        { year: 2020, probability: 0.58 },
        { year: 2021, probability: 0.54 },
        { year: 2022, probability: 0.56 },
        { year: 2023, probability: 0.55 },
        { year: 2024, probability: 0.55 }
      ],
      very_wet: [
        { year: 2015, probability: 0.48 },
        { year: 2016, probability: 0.52 },
        { year: 2017, probability: 0.49 },
        { year: 2018, probability: 0.51 },
        { year: 2019, probability: 0.50 },
        { year: 2020, probability: 0.53 },
        { year: 2021, probability: 0.49 },
        { year: 2022, probability: 0.51 },
        { year: 2023, probability: 0.50 },
        { year: 2024, probability: 0.50 }
      ],
      very_windy: [
        { year: 2015, probability: 0.33 },
        { year: 2016, probability: 0.37 },
        { year: 2017, probability: 0.34 },
        { year: 2018, probability: 0.36 },
        { year: 2019, probability: 0.35 },
        { year: 2020, probability: 0.38 },
        { year: 2021, probability: 0.34 },
        { year: 2022, probability: 0.36 },
        { year: 2023, probability: 0.35 },
        { year: 2024, probability: 0.35 }
      ],
      very_cold: [
        { year: 2015, probability: 0.11 },
        { year: 2016, probability: 0.09 },
        { year: 2017, probability: 0.10 },
        { year: 2018, probability: 0.09 },
        { year: 2019, probability: 0.10 },
        { year: 2020, probability: 0.10 },
        { year: 2021, probability: 0.11 },
        { year: 2022, probability: 0.09 },
        { year: 2023, probability: 0.10 },
        { year: 2024, probability: 0.10 }
      ],
      very_uncomfortable: [
        { year: 2015, probability: 0.43 },
        { year: 2016, probability: 0.47 },
        { year: 2017, probability: 0.44 },
        { year: 2018, probability: 0.46 },
        { year: 2019, probability: 0.45 },
        { year: 2020, probability: 0.48 },
        { year: 2021, probability: 0.44 },
        { year: 2022, probability: 0.46 },
        { year: 2023, probability: 0.45 },
        { year: 2024, probability: 0.45 }
      ]
    }
  }
};

export const locations = Object.keys(weatherData);
export const dates = ["Jan 10", "Dec 16"];

export const conditionLabels: Record<keyof WeatherProbabilities, string> = {
  very_hot: "Very Hot",
  very_cold: "Very Cold",
  very_windy: "Very Windy",
  very_wet: "Very Wet",
  very_uncomfortable: "Very Uncomfortable"
};

export const conditionIcons: Record<keyof WeatherProbabilities, string> = {
  very_hot: "🌡️",
  very_cold: "❄️",
  very_windy: "💨",
  very_wet: "🌧️",
  very_uncomfortable: "💧"
};
