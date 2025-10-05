import { DailyWeatherPrediction } from './openWeatherService';
import { DailyPrediction } from './rainfallPredictionService';

export interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const checkNotificationPermission = (): NotificationPermissionStatus => {
  if (!('Notification' in window)) {
    return { granted: false, denied: true, default: false };
  }

  return {
    granted: Notification.permission === 'granted',
    denied: Notification.permission === 'denied',
    default: Notification.permission === 'default'
  };
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

export const scheduleWeatherNotification = async (
  weatherData: DailyWeatherPrediction | DailyPrediction,
  scheduledTime?: Date
): Promise<boolean> => {
  const permission = await requestNotificationPermission();
  if (!permission) {
    console.error('Notification permission not granted');
    return false;
  }

  const isOpenWeatherData = 'icon' in weatherData;
  const title = isOpenWeatherData 
    ? `Weather Update: ${weatherData.description}`
    : `Weather Update: ${weatherData.weather_description}`;

  const riskLevel = isOpenWeatherData 
    ? weatherData.riskLevel 
    : weatherData.risk_level;

  const riskEmoji = riskLevel === 'high' ? '⚠️' : riskLevel === 'moderate' ? '⚡' : '✅';
  
  const body = `${riskEmoji} ${riskLevel.toUpperCase()} RISK
🌡️ Temperature: ${weatherData.temperature}°C
💧 Humidity: ${weatherData.humidity}%
${isOpenWeatherData 
  ? `🌧️ Rain Chance: ${weatherData.precipProbability}%`
  : `🌧️ Rain: ${Math.round(weatherData.rainfall_probability * 100)}% (${weatherData.predicted_rainfall_mm}mm)`
}`;

  try {
    // For immediate notification
    if (!scheduledTime || scheduledTime <= new Date()) {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'weather-update',
        requireInteraction: false,
      });
      return true;
    }

    // For scheduled notifications, we would need to use Service Worker with Push API
    // This is simplified for now - in production, you'd use a backend service
    console.log('Scheduled notification for:', scheduledTime);
    return true;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return false;
  }
};

export const scheduleDailyNotifications = async (
  predictions: Array<DailyWeatherPrediction | DailyPrediction>
): Promise<number> => {
  const permission = await requestNotificationPermission();
  if (!permission) {
    return 0;
  }

  let scheduled = 0;
  const now = new Date();

  for (const prediction of predictions) {
    const predDate = 'dateString' in prediction 
      ? new Date(prediction.dateString)
      : new Date(prediction.date);
    
    // Schedule notification for 7 AM on the prediction date
    const notificationTime = new Date(predDate);
    notificationTime.setHours(7, 0, 0, 0);

    if (notificationTime > now) {
      // In a real app, you'd send this to a backend service
      // For now, we'll just log it
      console.log(`Would schedule notification for ${notificationTime.toISOString()}`);
      scheduled++;
    }
  }

  return scheduled;
};

export const sendTestNotification = async (): Promise<boolean> => {
  const permission = await requestNotificationPermission();
  if (!permission) {
    return false;
  }

  try {
    new Notification('Weather Calendar Test', {
      body: '🌤️ Your daily weather notifications are now enabled!\n\nYou\'ll receive updates every morning at 7 AM.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'test-notification',
    });
    return true;
  } catch (error) {
    console.error('Failed to show test notification:', error);
    return false;
  }
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('Service Worker unregistered successfully');
    return true;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
};
