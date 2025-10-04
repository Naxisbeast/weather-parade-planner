export interface WeatherProbabilities {
  very_hot: number;
  very_cold: number;
  very_windy: number;
  very_wet: number;
  very_uncomfortable: number;
}

export interface LocationData {
  [date: string]: WeatherProbabilities;
}

export interface WeatherData {
  [location: string]: LocationData;
}

export const weatherData: WeatherData = {
  "Cape Town": {
    "Jan 10": {
      very_hot: 0.65,
      very_cold: 0.05,
      very_windy: 0.40,
      very_wet: 0.25,
      very_uncomfortable: 0.30
    },
    "Dec 16": {
      very_hot: 0.55,
      very_cold: 0.10,
      very_windy: 0.35,
      very_wet: 0.50,
      very_uncomfortable: 0.45
    }
  },
  "Johannesburg": {
    "Jan 10": {
      very_hot: 0.45,
      very_cold: 0.15,
      very_windy: 0.20,
      very_wet: 0.60,
      very_uncomfortable: 0.50
    },
    "Dec 16": {
      very_hot: 0.35,
      very_cold: 0.20,
      very_windy: 0.25,
      very_wet: 0.70,
      very_uncomfortable: 0.55
    }
  },
  "Durban": {
    "Jan 10": {
      very_hot: 0.75,
      very_cold: 0.02,
      very_windy: 0.30,
      very_wet: 0.40,
      very_uncomfortable: 0.65
    },
    "Dec 16": {
      very_hot: 0.80,
      very_cold: 0.01,
      very_windy: 0.35,
      very_wet: 0.50,
      very_uncomfortable: 0.70
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
