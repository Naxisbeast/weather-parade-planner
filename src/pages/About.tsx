import Navigation from "@/components/Navigation";
import StarryBackground from "@/components/StarryBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Satellite, TrendingUp, Sparkles, Target, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarryBackground />
      <Navigation />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-block p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-lg mb-4">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              About NASA Weather Analysis
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              AI-powered weather intelligence with personalized recommendations for smarter planning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Satellite,
                title: "NASA POWER Data",
                description: "Real satellite data from NASA's Prediction Of Worldwide Energy Resources",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: TrendingUp,
                title: "ML Forecasting",
                description: "Prophet & ARIMA models for accurate time-series weather predictions",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: Target,
                title: "Personalized Insights",
                description: "Tailored recommendations based on your activities and sensitivities",
                gradient: "from-green-500 to-emerald-500"
              }
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-2 border-transparent hover:border-sky-500/50 dark:hover:border-sky-400/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <CardHeader>
                  <div className={`p-3 bg-gradient-to-br ${feature.gradient} rounded-xl w-fit mb-3 shadow-md`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-2 border-sky-500/30 shadow-xl animate-slide-up">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                Our application combines cutting-edge machine learning with NASA's comprehensive weather data
                to provide accurate forecasts and personalized recommendations for your specific needs.
              </p>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Key Features:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Real-time NASA POWER API integration",
                    "Prophet & ARIMA forecasting models",
                    "Historical weather pattern analysis",
                    "Risk level assessment (High/Moderate/Low)",
                    "Personalized clothing recommendations",
                    "Activity suitability ratings",
                    "Organizational safety guidelines",
                    "Weather sensitivity alerts",
                    "Nearby attractions suggestions",
                    "CSV & JSON data export"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-lg border border-sky-500/30">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Weather Analysis:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-sky-600 dark:text-sky-400">Temperature:</span>
                    <span>Track daily temps with confidence intervals and trend analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-blue-600 dark:text-blue-400">Precipitation:</span>
                    <span>Monitor rainfall patterns with forecasted precipitation levels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">Wind Speed:</span>
                    <span>Assess wind conditions for outdoor activity planning</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-md bg-gradient-to-br from-sky-500 to-blue-600 text-white border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  For Individuals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2">
                  {[
                    "Personalized clothing suggestions",
                    "Activity suitability ratings",
                    "Safety tips based on sensitivities",
                    "Nearby places recommendations",
                    "Temperature unit preferences"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Database className="h-6 w-6" />
                  For Organizations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2">
                  {[
                    "Operational safety recommendations",
                    "Employee protection guidelines",
                    "Site management advice",
                    "Productivity optimization",
                    "Risk assessment tools"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-2 border-green-500/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Frontend</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• React + TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• Recharts for visualizations</li>
                    <li>• Shadcn/ui components</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Backend</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• FastAPI microservice</li>
                    <li>• Prophet & ARIMA models</li>
                    <li>• Supabase database</li>
                    <li>• NASA POWER API</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default About;
