import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { ArrowRight, Cloud, Calendar, TrendingUp, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Cloud className="h-4 w-4" />
            Data-Driven Weather Insights
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Will It{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Rain on My Parade?
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plan your outdoor events with confidence using historical weather data analysis.
            Know the probabilities before you commit.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-sky hover:opacity-90 transition-opacity text-lg px-8">
                Start Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-background/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Use Our Platform?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-sky flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Plan Ahead</h3>
                <p className="text-muted-foreground">
                  Get weather probability forecasts months in advance for any date and location.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-sky flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Data-Driven</h3>
                <p className="text-muted-foreground">
                  Powered by NASA's historical weather data for accurate probability analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-sky flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Make Confident Decisions</h3>
                <p className="text-muted-foreground">
                  Understand the risks and plan accordingly for your important outdoor events.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto shadow-lg bg-gradient-sky text-primary-foreground">
          <CardContent className="py-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">
              Ready to Plan Your Next Event?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Start analyzing weather probabilities now and make informed decisions for your outdoor activities.
            </p>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
