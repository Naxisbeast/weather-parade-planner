import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History as HistoryIcon, MapPin, Calendar, Trash2, Loader2, TrendingUp, Droplets, Wind } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface WeatherSearch {
  id: string;
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

const History = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searches, setSearches] = useState<WeatherSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    loadSearchHistory();
  }, [isAuthenticated, navigate]);

  const loadSearchHistory = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('weather_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSearches(data || []);
    } catch (error: any) {
      console.error('Error loading search history:', error);
      toast.error("Failed to load search history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('weather_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSearches(searches.filter(s => s.id !== id));
      toast.success("Search deleted successfully");
    } catch (error: any) {
      console.error('Error deleting search:', error);
      toast.error("Failed to delete search");
    } finally {
      setDeletingId(null);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-500 hover:bg-red-600';
      case 'Moderate':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Low':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Navigation />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            Search History
          </h1>
          <p className="text-muted-foreground">
            View your past weather analyses
          </p>
        </div>

        {searches.length === 0 ? (
          <Card className="shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <HistoryIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-xl font-medium text-muted-foreground mb-2">No search history yet</p>
              <p className="text-sm text-muted-foreground mb-6">Start analyzing weather data to build your history</p>
              <Button onClick={() => navigate("/dashboard")} className="bg-gradient-to-r from-purple-600 to-pink-600">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {searches.map((search) => (
              <Card key={search.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <MapPin className="h-5 w-5 text-primary" />
                        {search.location_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(search.start_date), 'MMM d, yyyy')} - {format(new Date(search.end_date), 'MMM d, yyyy')}
                        <span className="text-xs text-muted-foreground ml-2">
                          • Analyzed {format(new Date(search.created_at), 'MMM d, yyyy')}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(search.risk_level)}>
                        {search.risk_level} Risk
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(search.id)}
                        disabled={deletingId === search.id}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        {deletingId === search.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4" />
                        Temperature
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {search.avg_temperature}°C
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {search.min_temperature}°C - {search.max_temperature}°C
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Droplets className="h-4 w-4" />
                        Rainfall
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {search.avg_rainfall} mm
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Max: {search.max_rainfall} mm
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Wind className="h-4 w-4" />
                        Wind Speed
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {search.avg_windspeed} m/s
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Max: {search.max_windspeed} m/s
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-xl">
                      <div className="text-sm text-muted-foreground mb-1">
                        Location
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {search.latitude.toFixed(4)}°
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {search.longitude.toFixed(4)}°
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;