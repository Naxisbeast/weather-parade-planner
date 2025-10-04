import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Satellite, TrendingUp } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              About Will It Rain on My Parade?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A data-driven approach to planning outdoor events with confidence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <Satellite className="h-12 w-12 text-primary mb-2" />
                <CardTitle>NASA Data</CardTitle>
                <CardDescription>
                  Leveraging historical weather data from NASA's Earth observation systems
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-accent mb-2" />
                <CardTitle>Probability Analysis</CardTitle>
                <CardDescription>
                  Statistical analysis of decades of weather patterns to predict conditions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <Database className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Prototype Data</CardTitle>
                <CardDescription>
                  Currently using representative dummy data for demonstration purposes
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Our application analyzes historical weather patterns to calculate the probability
                of adverse conditions occurring on specific dates and locations. This helps event
                planners make informed decisions months in advance.
              </p>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Weather Conditions Analyzed:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Very Hot:</strong> Temperatures significantly above seasonal norms</li>
                  <li><strong>Very Cold:</strong> Temperatures significantly below seasonal norms</li>
                  <li><strong>Very Windy:</strong> Wind speeds that could affect outdoor activities</li>
                  <li><strong>Very Wet:</strong> High probability of significant rainfall</li>
                  <li><strong>Very Uncomfortable:</strong> Overall discomfort index combining multiple factors</li>
                </ul>
              </div>

              <p>
                Each probability is calculated based on historical occurrence rates, giving you
                actionable insights for planning your outdoor events.
              </p>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm">
                  <strong>Note:</strong> This is a prototype demonstration using representative
                  dummy data. The full version will integrate directly with NASA's Earth data APIs
                  for real-time analysis with global coverage.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-sky text-primary-foreground">
            <CardHeader>
              <CardTitle>Future Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Our roadmap includes:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Direct integration with NASA Earth data APIs</li>
                <li>Global coverage for any location worldwide</li>
                <li>Real-time updates and trend analysis</li>
                <li>Mobile app for on-the-go planning</li>
                <li>Custom alerts and notifications</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default About;
