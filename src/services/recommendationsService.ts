import { WeatherStats } from './nasaWeatherService';

export interface ClothingRecommendation {
  category: string;
  items: string[];
  reason: string;
}

export interface ActivityRecommendation {
  activity: string;
  suitability: 'excellent' | 'good' | 'fair' | 'poor';
  reason: string;
}

export interface SafetyTip {
  priority: 'high' | 'medium' | 'low';
  message: string;
}

export interface OrganizationalAdvice {
  category: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PersonalizedRecommendations {
  clothing?: ClothingRecommendation[];
  activities?: ActivityRecommendation[];
  safetyTips: SafetyTip[];
  organizationalAdvice?: OrganizationalAdvice[];
}

export const generateClothingRecommendations = (
  stats: WeatherStats,
  sensitivities: string[]
): ClothingRecommendation[] => {
  const recommendations: ClothingRecommendation[] = [];
  const temp = stats.avgTemperature;
  const maxTemp = stats.maxTemperature;
  const minTemp = stats.minTemperature;
  const wind = stats.avgWindspeed;
  const rain = stats.avgRainfall;

  if (temp < 5) {
    recommendations.push({
      category: 'Cold Weather',
      items: ['Heavy winter coat', 'Thermal underwear', 'Gloves', 'Warm hat', 'Insulated boots', 'Scarf'],
      reason: `Very cold conditions (${temp}°C average)`
    });
  } else if (temp < 15) {
    recommendations.push({
      category: 'Cool Weather',
      items: ['Jacket or sweater', 'Long pants', 'Closed-toe shoes', 'Light scarf'],
      reason: `Cool temperatures (${temp}°C average)`
    });
  } else if (temp < 25) {
    recommendations.push({
      category: 'Moderate Weather',
      items: ['Light jacket', 'Comfortable clothing', 'Sneakers or casual shoes'],
      reason: `Moderate temperatures (${temp}°C average)`
    });
  } else if (temp < 30) {
    recommendations.push({
      category: 'Warm Weather',
      items: ['Light breathable clothing', 'Shorts or light pants', 'Sandals', 'Sunglasses', 'Hat'],
      reason: `Warm conditions (${temp}°C average)`
    });
  } else {
    recommendations.push({
      category: 'Hot Weather',
      items: ['Lightweight breathable fabrics', 'Shorts', 'Sandals', 'Wide-brimmed hat', 'Sunglasses', 'Sunscreen'],
      reason: `Hot conditions (${temp}°C average)`
    });
  }

  if (wind > 10) {
    recommendations.push({
      category: 'Windy Conditions',
      items: ['Windbreaker', 'Wind-resistant jacket', 'Secure hat or no hat'],
      reason: `Strong winds (${wind} m/s average)`
    });
  }

  if (rain > 1) {
    recommendations.push({
      category: 'Rainy Weather',
      items: ['Waterproof jacket', 'Umbrella', 'Water-resistant shoes', 'Rain pants'],
      reason: `Rainy conditions (${rain}mm average daily rainfall)`
    });
  }

  if (sensitivities.includes('heat') && maxTemp > 30) {
    recommendations.push({
      category: 'Heat Sensitivity',
      items: ['Light-colored clothing', 'Moisture-wicking fabrics', 'Cooling towel', 'Portable fan'],
      reason: 'Based on your heat sensitivity'
    });
  }

  if (sensitivities.includes('cold') && minTemp < 10) {
    recommendations.push({
      category: 'Cold Sensitivity',
      items: ['Extra warm layers', 'Hand warmers', 'Thermal socks', 'Insulated jacket'],
      reason: 'Based on your cold sensitivity'
    });
  }

  return recommendations;
};

export const generateActivityRecommendations = (
  stats: WeatherStats,
  activities: string[]
): ActivityRecommendation[] => {
  const recommendations: ActivityRecommendation[] = [];
  const temp = stats.avgTemperature;
  const rain = stats.maxRainfall;
  const wind = stats.maxWindspeed;

  const activityMap: Record<string, { ideal: [number, number]; riskRain: number; riskWind: number }> = {
    hiking: { ideal: [15, 25], riskRain: 5, riskWind: 15 },
    running: { ideal: [10, 20], riskRain: 3, riskWind: 12 },
    cycling: { ideal: [15, 28], riskRain: 2, riskWind: 10 },
    'outdoor sports': { ideal: [18, 28], riskRain: 5, riskWind: 12 },
    construction: { ideal: [10, 30], riskRain: 10, riskWind: 15 },
    events: { ideal: [18, 28], riskRain: 5, riskWind: 12 },
    gardening: { ideal: [15, 28], riskRain: 15, riskWind: 20 },
    camping: { ideal: [15, 25], riskRain: 5, riskWind: 15 },
    'beach activities': { ideal: [25, 35], riskRain: 2, riskWind: 15 },
    fishing: { ideal: [15, 28], riskRain: 8, riskWind: 12 }
  };

  activities.forEach(activity => {
    const activityKey = activity.toLowerCase();
    const config = activityMap[activityKey] || { ideal: [15, 25], riskRain: 5, riskWind: 12 };

    let suitability: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    let reasons: string[] = [];

    if (temp < config.ideal[0] - 5 || temp > config.ideal[1] + 5) {
      suitability = 'poor';
      reasons.push(`temperature not ideal (${temp}°C)`);
    } else if (temp < config.ideal[0] || temp > config.ideal[1]) {
      suitability = suitability === 'excellent' ? 'good' : suitability;
      reasons.push('temperature slightly outside ideal range');
    }

    if (rain > config.riskRain * 2) {
      suitability = 'poor';
      reasons.push(`heavy rainfall (${rain}mm)`);
    } else if (rain > config.riskRain) {
      suitability = suitability === 'excellent' ? 'fair' : suitability;
      reasons.push('moderate rainfall expected');
    }

    if (wind > config.riskWind * 1.5) {
      suitability = 'poor';
      reasons.push(`very windy conditions (${wind} m/s)`);
    } else if (wind > config.riskWind) {
      suitability = suitability === 'excellent' ? 'fair' : suitability;
      reasons.push('windy conditions');
    }

    if (reasons.length === 0) {
      reasons.push('ideal weather conditions');
    }

    recommendations.push({
      activity,
      suitability,
      reason: reasons.join(', ')
    });
  });

  return recommendations;
};

export const generateSafetyTips = (
  stats: WeatherStats,
  sensitivities: string[]
): SafetyTip[] => {
  const tips: SafetyTip[] = [];
  const temp = stats.avgTemperature;
  const maxTemp = stats.maxTemperature;
  const minTemp = stats.minTemperature;
  const rain = stats.maxRainfall;
  const wind = stats.maxWindspeed;

  if (maxTemp > 35) {
    tips.push({
      priority: 'high',
      message: `Extreme heat warning (${maxTemp}°C). Stay hydrated, avoid outdoor activities during peak hours (11am-4pm), seek air-conditioned spaces, and watch for signs of heat exhaustion.`
    });
  } else if (maxTemp > 30) {
    tips.push({
      priority: 'medium',
      message: `High temperatures expected (${maxTemp}°C). Drink plenty of water, wear sunscreen (SPF 30+), and take breaks in shaded areas.`
    });
  }

  if (minTemp < 0) {
    tips.push({
      priority: 'high',
      message: `Freezing conditions (${minTemp}°C). Risk of hypothermia and frostbite. Dress in layers, cover exposed skin, and limit time outdoors.`
    });
  } else if (minTemp < 5) {
    tips.push({
      priority: 'medium',
      message: `Very cold temperatures (${minTemp}°C). Dress warmly in layers and protect extremities from cold exposure.`
    });
  }

  if (rain > 20) {
    tips.push({
      priority: 'high',
      message: `Heavy rainfall expected (${rain}mm). Risk of flooding. Avoid low-lying areas, do not drive through flooded roads, and stay informed about weather alerts.`
    });
  } else if (rain > 10) {
    tips.push({
      priority: 'medium',
      message: `Moderate to heavy rain (${rain}mm). Roads may be slippery. Drive carefully and carry waterproof gear.`
    });
  }

  if (wind > 20) {
    tips.push({
      priority: 'high',
      message: `Dangerous wind conditions (${wind} m/s). Secure loose objects, avoid tall trees and structures, and postpone outdoor activities.`
    });
  } else if (wind > 15) {
    tips.push({
      priority: 'medium',
      message: `Strong winds expected (${wind} m/s). Be cautious outdoors and secure loose items.`
    });
  }

  if (sensitivities.includes('heat') && temp > 25) {
    tips.push({
      priority: 'medium',
      message: 'Based on your heat sensitivity: Limit outdoor exposure, stay in cool environments, and monitor for heat-related symptoms.'
    });
  }

  if (sensitivities.includes('cold') && temp < 15) {
    tips.push({
      priority: 'medium',
      message: 'Based on your cold sensitivity: Wear extra layers, protect extremities, and limit exposure to cold air.'
    });
  }

  if (sensitivities.includes('rain') && rain > 5) {
    tips.push({
      priority: 'low',
      message: 'Based on your rain sensitivity: Carry waterproof gear and plan indoor alternatives.'
    });
  }

  if (sensitivities.includes('wind') && wind > 10) {
    tips.push({
      priority: 'low',
      message: 'Based on your wind sensitivity: Avoid exposed areas and wear wind-resistant clothing.'
    });
  }

  if (tips.length === 0) {
    tips.push({
      priority: 'low',
      message: 'Weather conditions are within normal ranges. Enjoy your day!'
    });
  }

  return tips;
};

export const generateOrganizationalAdvice = (
  stats: WeatherStats
): OrganizationalAdvice[] => {
  const advice: OrganizationalAdvice[] = [];
  const temp = stats.avgTemperature;
  const maxTemp = stats.maxTemperature;
  const minTemp = stats.minTemperature;
  const rain = stats.maxRainfall;
  const wind = stats.maxWindspeed;

  if (maxTemp > 35 || minTemp < 0) {
    advice.push({
      category: 'Employee Safety',
      recommendation: 'Implement extreme weather protocols. Provide additional breaks in climate-controlled areas. Consider rescheduling outdoor work to cooler/warmer parts of the day or postponing non-essential tasks.',
      priority: 'high'
    });
  } else if (maxTemp > 30 || minTemp < 5) {
    advice.push({
      category: 'Employee Safety',
      recommendation: 'Monitor employees working outdoors. Ensure access to water/warm beverages and appropriate rest areas. Provide weather-appropriate safety equipment.',
      priority: 'medium'
    });
  }

  if (rain > 20) {
    advice.push({
      category: 'Operations',
      recommendation: 'Reschedule outdoor operations. Ensure proper drainage around facilities. Review emergency flooding procedures and have contingency plans ready.',
      priority: 'high'
    });
  } else if (rain > 10) {
    advice.push({
      category: 'Operations',
      recommendation: 'Prepare for wet conditions. Ensure workers have waterproof gear. Schedule weather-sensitive tasks for drier periods. Monitor weather updates regularly.',
      priority: 'medium'
    });
  }

  if (wind > 20) {
    advice.push({
      category: 'Site Safety',
      recommendation: 'Suspend operations involving heights, cranes, or scaffolding. Secure all loose equipment and materials. Conduct site safety inspections before and after wind events.',
      priority: 'high'
    });
  } else if (wind > 15) {
    advice.push({
      category: 'Site Safety',
      recommendation: 'Exercise caution with elevated work. Secure loose items. Brief employees on wind safety protocols.',
      priority: 'medium'
    });
  }

  if (maxTemp > 25) {
    advice.push({
      category: 'Productivity',
      recommendation: 'Schedule demanding physical tasks during cooler morning hours. Increase break frequency. Ensure adequate hydration stations are available.',
      priority: 'medium'
    });
  }

  if (rain > 5 || wind > 10) {
    advice.push({
      category: 'Event Planning',
      recommendation: 'Prepare contingency plans for outdoor events. Consider tent reinforcements or indoor backup venues. Communicate weather plans to attendees in advance.',
      priority: 'medium'
    });
  }

  advice.push({
    category: 'Communication',
    recommendation: 'Keep employees informed of weather conditions and any operational changes. Establish clear communication channels for weather-related updates.',
    priority: 'low'
  });

  return advice;
};

export const generatePersonalizedRecommendations = (
  stats: WeatherStats
): PersonalizedRecommendations => {
  const sensitivities: string[] = [];
  const activities: string[] = [];

  const recommendations: PersonalizedRecommendations = {
    safetyTips: generateSafetyTips(stats, sensitivities),
    clothing: generateClothingRecommendations(stats, sensitivities),
    activities: generateActivityRecommendations(stats, activities)
  };

  return recommendations;
};
