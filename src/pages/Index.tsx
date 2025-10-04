import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, TrendingUp, Download, MapPin } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Plan Smarter. Know Your Odds.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Predict weather probabilities months in advance using historical NASA data.
            Perfect for event planning, outdoor activities, and travel.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-sky hover:opacity-90 transition-opacity">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-sky hover:opacity-90 transition-opacity">
                    Sign Up
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline">
                    Try Demo
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                <CloudRain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Weather Probabilities</CardTitle>
              <CardDescription>
                Get probability forecasts for hot, cold, windy, wet, and uncomfortable conditions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-2">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Historical Trends</CardTitle>
              <CardDescription>
                View 10-year weather patterns to make informed decisions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-2">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Location Search</CardTitle>
              <CardDescription>
                Analyze weather data for multiple cities and regions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-2">
                <Download className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Download analysis results in CSV or JSON format
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center space-y-4 p-8 bg-card rounded-lg shadow-md border">
          <h2 className="text-2xl font-bold">Powered by NASA Data</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our predictions are based on historical weather patterns from NASA Earth observation archives.
            Currently running in prototype mode with sample data.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
