import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  user_id: string;
  user_type: 'individual' | 'organization';
  full_name: string;
  organization_name?: string;
  city: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_activities: string[];
  weather_sensitivities: string[];
  temperature_unit: 'celsius' | 'fahrenheit';
  created_at: string;
  updated_at: string;
}

export interface WeatherSearch {
  id: string;
  user_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  avg_temperature: number;
  max_temperature: number;
  min_temperature: number;
  avg_rainfall: number;
  max_rainfall: number;
  avg_windspeed: number;
  max_windspeed: number;
  risk_level: string;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}
