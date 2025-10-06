import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ACTIVITY_OPTIONS = [
  'Hiking', 'Running', 'Cycling', 'Outdoor Sports', 'Construction',
  'Events', 'Gardening', 'Camping', 'Beach Activities', 'Fishing'
];

const SENSITIVITY_OPTIONS = [
  'Heat', 'Cold', 'Rain', 'Wind', 'Humidity'
];

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"individual" | "organization">("individual");
  const [organizationName, setOrganizationName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [preferredActivities, setPreferredActivities] = useState<string[]>([]);
  const [weatherSensitivities, setWeatherSensitivities] = useState<string[]>([]);
  const [temperatureUnit, setTemperatureUnit] = useState<"celsius" | "fahrenheit">("celsius");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    loadProfile();
  }, [isAuthenticated, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || "");
        setUserType((profile.user_type as "individual" | "organization") || "individual");
        setOrganizationName(profile.organization_name || "");
        setCity(profile.city || "");
        setCountry(profile.country || "");
      }

      if (preferences) {
        setPreferredActivities(preferences.preferred_activities || []);
        setWeatherSensitivities(preferences.weather_sensitivities || []);
        setTemperatureUnit((preferences.temperature_unit as "celsius" | "fahrenheit") || "celsius");
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          user_type: userType,
          organization_name: userType === 'organization' ? organizationName : null,
          city,
          country
        });

      if (profileError) throw profileError;

      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_activities: preferredActivities,
          weather_sensitivities: weatherSensitivities,
          temperature_unit: temperatureUnit
        });

      if (preferencesError) throw preferencesError;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActivity = (activity: string) => {
    setPreferredActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const toggleSensitivity = (sensitivity: string) => {
    setWeatherSensitivities(prev =>
      prev.includes(sensitivity)
        ? prev.filter(s => s !== sensitivity)
        : [...prev, sensitivity]
    );
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
            Your Profile
          </h1>
          <p className="text-muted-foreground">
            Customize your preferences for personalized weather insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your basic profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">Account Type</Label>
                <Select value={userType} onValueChange={(value: "individual" | "organization") => setUserType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {userType === 'organization' && (
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Company name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Your city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Your country"
                />
              </div>
            </CardContent>
          </Card>

          {/* Weather Preferences */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Weather Preferences</CardTitle>
              <CardDescription>
                Customize your weather analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Preferred Activities</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_OPTIONS.map((activity) => (
                    <div key={activity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`activity-${activity}`}
                        checked={preferredActivities.includes(activity)}
                        onCheckedChange={() => toggleActivity(activity)}
                      />
                      <Label htmlFor={`activity-${activity}`} className="text-sm cursor-pointer">
                        {activity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Weather Sensitivities</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SENSITIVITY_OPTIONS.map((sensitivity) => (
                    <div key={sensitivity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sensitivity-${sensitivity}`}
                        checked={weatherSensitivities.includes(sensitivity)}
                        onCheckedChange={() => toggleSensitivity(sensitivity)}
                      />
                      <Label htmlFor={`sensitivity-${sensitivity}`} className="text-sm cursor-pointer">
                        {sensitivity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperatureUnit">Temperature Unit</Label>
                <Select value={temperatureUnit} onValueChange={(value: "celsius" | "fahrenheit") => setTemperatureUnit(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celsius">Celsius (°C)</SelectItem>
                    <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            size="lg"
            className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 px-8"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;