/*
  # Create weather searches and favorites tables

  1. New Tables
    - `weather_searches`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `location_name` (text)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `start_date` (date)
      - `end_date` (date)
      - `avg_temperature` (numeric)
      - `max_temperature` (numeric)
      - `min_temperature` (numeric)
      - `avg_rainfall` (numeric)
      - `max_rainfall` (numeric)
      - `avg_windspeed` (numeric)
      - `max_windspeed` (numeric)
      - `risk_level` (text)
      - `created_at` (timestamp)
    
    - `user_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `location_name` (text)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS weather_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  avg_temperature numeric,
  max_temperature numeric,
  min_temperature numeric,
  avg_rainfall numeric,
  max_rainfall numeric,
  avg_windspeed numeric,
  max_windspeed numeric,
  risk_level text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, latitude, longitude)
);

ALTER TABLE weather_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weather searches"
  ON weather_searches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weather searches"
  ON weather_searches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weather searches"
  ON weather_searches
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own favorites"
  ON user_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_weather_searches_user_id ON weather_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_searches_created_at ON weather_searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
