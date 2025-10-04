import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface LocationMapProps {
  location: string;
}

const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  "Cape Town": { lat: -33.9249, lng: 18.4241 },
  "Johannesburg": { lat: -26.2041, lng: 28.0473 },
  "Durban": { lat: -29.8587, lng: 31.0218 }
};

const LocationMap = ({ location }: LocationMapProps) => {
  const coords = locationCoordinates[location];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-8 flex flex-col items-center justify-center space-y-3">
          <MapPin className="h-16 w-16 text-primary" />
          <div className="text-center">
            <p className="font-semibold text-lg">{location}</p>
            {coords && (
              <p className="text-sm text-muted-foreground">
                {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Map integration coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMap;
