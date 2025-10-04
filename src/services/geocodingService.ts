export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  state?: string;
}

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

export const searchLocationByName = async (query: string): Promise<GeoLocation[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const url = `${NOMINATIM_API}?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WeatherAnalysisApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const results: NominatimResult[] = await response.json();

    return results.map(result => {
      const cityName = result.address?.city ||
                       result.address?.town ||
                       result.address?.village ||
                       result.display_name.split(',')[0];

      return {
        name: cityName,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        country: result.address?.country,
        state: result.address?.state
      };
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

export const parseCoordinates = (input: string): GeoLocation | null => {
  const coordRegex = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/;
  const match = input.trim().match(coordRegex);

  if (match) {
    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);

    if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
      return {
        name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        latitude,
        longitude
      };
    }
  }

  return null;
};

export const getLocationDisplay = (location: GeoLocation): string => {
  if (location.state && location.country) {
    return `${location.name}, ${location.state}, ${location.country}`;
  }
  if (location.country) {
    return `${location.name}, ${location.country}`;
  }
  return location.name;
};
