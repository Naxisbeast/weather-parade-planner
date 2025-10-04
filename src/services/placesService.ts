export interface PlaceResult {
  name: string;
  address: string;
  rating?: number;
  types: string[];
  photoUrl?: string;
}

const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

export const searchNearbyPlaces = async (
  latitude: number,
  longitude: number,
  activity: string
): Promise<PlaceResult[]> => {
  if (!PLACES_API_KEY) {
    console.warn('Google Places API key not configured');
    return generateMockPlaces(activity);
  }

  try {
    const activityTypeMap: Record<string, string> = {
      hiking: 'park',
      running: 'park',
      cycling: 'park',
      'outdoor sports': 'stadium',
      events: 'tourist_attraction',
      gardening: 'park',
      camping: 'campground',
      'beach activities': 'beach',
      fishing: 'lake',
      restaurant: 'restaurant',
      shopping: 'shopping_mall',
      museum: 'museum',
      entertainment: 'movie_theater'
    };

    const placeType = activityTypeMap[activity.toLowerCase()] || 'tourist_attraction';

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=${placeType}&key=${PLACES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Places API request failed');
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${data.status}`);
    }

    return data.results.slice(0, 5).map((place: any) => ({
      name: place.name,
      address: place.vicinity,
      rating: place.rating,
      types: place.types,
      photoUrl: place.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${PLACES_API_KEY}`
        : undefined
    }));
  } catch (error) {
    console.error('Error fetching places:', error);
    return generateMockPlaces(activity);
  }
};

const generateMockPlaces = (activity: string): PlaceResult[] => {
  const mockPlaces: Record<string, PlaceResult[]> = {
    hiking: [
      { name: 'Mountain Trail Park', address: 'Local hiking area', rating: 4.5, types: ['park'] },
      { name: 'Forest Reserve', address: 'Nature preserve', rating: 4.7, types: ['park'] },
      { name: 'Scenic Overlook Trail', address: 'Mountain viewpoint', rating: 4.3, types: ['park'] }
    ],
    running: [
      { name: 'City Park Running Track', address: 'Central park area', rating: 4.4, types: ['park'] },
      { name: 'Riverside Path', address: 'Waterfront trail', rating: 4.6, types: ['park'] }
    ],
    cycling: [
      { name: 'Bike Trail Network', address: 'Multi-use trail', rating: 4.5, types: ['park'] },
      { name: 'Coastal Cycling Route', address: 'Scenic coastal path', rating: 4.8, types: ['park'] }
    ],
    events: [
      { name: 'Convention Center', address: 'Downtown event venue', rating: 4.3, types: ['tourist_attraction'] },
      { name: 'Cultural Center', address: 'Arts and events space', rating: 4.5, types: ['tourist_attraction'] }
    ],
    default: [
      { name: 'Local Attraction', address: 'City center', rating: 4.2, types: ['tourist_attraction'] },
      { name: 'Popular Venue', address: 'Downtown area', rating: 4.4, types: ['tourist_attraction'] }
    ]
  };

  return mockPlaces[activity.toLowerCase()] || mockPlaces.default;
};
