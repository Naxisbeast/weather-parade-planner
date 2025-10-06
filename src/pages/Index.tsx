import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import StarryBackground from "@/components/StarryBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, TrendingUp, Download, MapPin, Sparkles, Zap, Shield } from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarryBackground />
      <Navigation />

      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16 space-y-6">
          <div className="animate-fade-in">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 dark:bg-sky-400/10 backdrop-blur-sm border border-sky-500/20 rounded-full">
                <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span className="text-sm font-medium text-sky-700 dark:text-sky-300">AI-Powered Weather Intelligence</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6 leading-tight">
              Plan Smarter.<br />Know Your Weather.
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Predict weather patterns with NASA satellite data. Get personalized recommendations
              for your activities, whether you're an individual or organization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Zap className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="border-2 border-sky-600 dark:border-sky-400 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/30 backdrop-blur-sm transition-all duration-300">
                    Try Demo
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: CloudRain,
              title: "Smart Predictions",
              description: "Advanced forecasting with Prophet & ARIMA models for accurate weather predictions",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: TrendingUp,
              title: "Historical Analysis",
              description: "Analyze weather patterns with comprehensive NASA POWER satellite data",
              gradient: "from-purple-500 to-pink-500"
            },
            {
              icon: MapPin,
              title: "Global Coverage",
              description: "Search any location worldwide with intelligent geocoding and suggestions",
              gradient: "from-green-500 to-emerald-500"
            },
            {
              icon: Shield,
              title: "Personalized Insights",
              description: "Get tailored recommendations based on your preferences and sensitivities",
              gradient: "from-orange-500 to-red-500"
            }
          ].map((feature, idx) => (
            <Card
              key={idx}
              className="group relative overflow-hidden backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-2 border-transparent hover:border-sky-500/50 dark:hover:border-sky-400/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <CardHeader>
                <div className={`p-3 bg-gradient-to-br ${feature.gradient} rounded-xl w-fit mb-3 shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-gray-900 dark:text-white">{feature.title}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-2 border-sky-500/30 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-500/20 to-blue-500/20 rounded-bl-full"></div>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 text-gray-900 dark:text-white">
                <Sparkles className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                For Individuals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Personalized clothing recommendations",
                "Activity suitability ratings",
                "Weather sensitivity alerts",
                "Nearby places suggestions"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-500"></div>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-2 border-purple-500/30 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-bl-full"></div>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 text-gray-900 dark:text-white">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                For Organizations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Operational safety advice",
                "Employee protection guidelines",
                "Site management recommendations",
                "Productivity optimization tips"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-6 p-10 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl border-2 border-sky-500/30">
          <div className="inline-block p-4 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-lg mb-4">
            <CloudRain className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
            Powered by NASA POWER Data
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our analysis leverages NASA's Prediction Of Worldwide Energy Resources (POWER) satellite data,
            providing you with scientifically accurate weather insights from decades of Earth observation.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {["Real-time Data", "Global Coverage", "Historical Archive", "ML Predictions"].map((badge, idx) => (
              <div key={idx} className="px-4 py-2 bg-gradient-to-r from-sky-500/10 to-blue-500/10 backdrop-blur-sm border border-sky-500/20 rounded-full">
                <span className="text-sm font-medium text-sky-700 dark:text-sky-300">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
