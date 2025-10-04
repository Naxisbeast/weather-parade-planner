import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shirt, Activity, TriangleAlert as AlertTriangle, Briefcase, MapPin } from "lucide-react";
import { PersonalizedRecommendations } from "@/services/recommendationsService";
import { PlaceResult } from "@/services/placesService";

interface RecommendationsPanelProps {
  recommendations: PersonalizedRecommendations;
  nearbyPlaces?: PlaceResult[];
  isIndividual: boolean;
}

const RecommendationsPanel = ({ recommendations, nearbyPlaces, isIndividual }: RecommendationsPanelProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Safety Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.safetyTips.map((tip, idx) => (
            <Alert key={idx} variant={tip.priority === 'high' ? 'destructive' : 'default'}>
              <AlertDescription className="flex items-start gap-2">
                <Badge variant={getPriorityColor(tip.priority)} className="mt-0.5">
                  {tip.priority}
                </Badge>
                <span className="flex-1">{tip.message}</span>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {isIndividual && recommendations.clothing && recommendations.clothing.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-5 w-5" />
              Clothing Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.clothing.map((clothing, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{clothing.category}</h4>
                  <Badge variant="outline">{clothing.reason}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {clothing.items.map((item, itemIdx) => (
                    <Badge key={itemIdx} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isIndividual && recommendations.activities && recommendations.activities.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Suitability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.activities.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{activity.activity}</p>
                  <p className="text-sm text-muted-foreground">{activity.reason}</p>
                </div>
                <Badge className={getSuitabilityColor(activity.suitability)}>
                  {activity.suitability}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!isIndividual && recommendations.organizationalAdvice && recommendations.organizationalAdvice.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Organizational Advice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.organizationalAdvice.map((advice, idx) => (
              <div key={idx} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{advice.category}</h4>
                  <Badge variant={getPriorityColor(advice.priority)}>
                    {advice.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{advice.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {nearbyPlaces && nearbyPlaces.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Nearby Places & Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearbyPlaces.map((place, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium">{place.name}</h4>
                  <p className="text-sm text-muted-foreground">{place.address}</p>
                  {place.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        ⭐ {place.rating}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecommendationsPanel;
