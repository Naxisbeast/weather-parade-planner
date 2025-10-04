import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase, UserProfile, UserPreferences } from "@/lib/supabase";

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

  const [userType, setUserType] = useState<'individual' | 'organization'>('individual');
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [preferredActivities, setPreferredActivities] = useState<string[]>([]);
  const [weatherSensitivities, setWeatherSensitivities] = useState<string[]>([]);
  const [temperatureUnit, setTemperatureUnit] = useState<'celsius' | 'fahrenheit'>('celsius');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    loadProfile();
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (profile) {
        setUserType(profile.user_type);
        setFullName(profile.full_name);
        setOrganizationName(profile.organization_name || '');
        setCity(profile.city);
        setCountry(profile.country);
      }

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (preferences) {
        setPreferredActivities(preferences.preferred_activities || []);
        setWeatherSensitivities(preferences.weather_sensitivities || []);
        setTemperatureUnit(preferences.temperature_unit || 'celsius');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName || !city || !country) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (userType === 'organization' && !organizationName) {
      toast.error('Please enter organization name');
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        toast.error('Not authenticated');
        return;
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: authUser.id,
          user_type: userType,
          full_name: fullName,
          organization_name: userType === 'organization' ? organizationName : null,
          city,
          country
        });

      if (profileError) throw profileError;

      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: authUser.id,
          preferred_activities: preferredActivities,
          weather_sensitivities: weatherSensitivities,
          temperature_unit: temperatureUnit
        });

      if (preferencesError) throw preferencesError;

      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
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
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sky-100 rounded-full">
              <User className="h-6 w-6 text-sky-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Profile & Preferences
            </h1>
          </div>
          <p className="text-muted-foreground">
            Customize your experience with personalized weather recommendations
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userType">Account Type</Label>
                <Select value={userType} onValueChange={(value: 'individual' | 'organization') => setUserType(value)}>
                  <SelectTrigger id="userType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  {userType === 'individual' ? 'Full Name' : 'Contact Name'} *
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={userType === 'individual' ? 'John Doe' : 'John Smith'}
                />
              </div>

              {userType === 'organization' && (
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input
                    id="organizationName"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Acme Corporation"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="London"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United Kingdom"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Weather Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Temperature Unit</Label>
                <Select value={temperatureUnit} onValueChange={(value: 'celsius' | 'fahrenheit') => setTemperatureUnit(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celsius">Celsius (°C)</SelectItem>
                    <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Weather Sensitivities</Label>
                <p className="text-sm text-muted-foreground">
                  Select conditions you're particularly sensitive to
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SENSITIVITY_OPTIONS.map(sensitivity => (
                    <div key={sensitivity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sensitivity-${sensitivity}`}
                        checked={weatherSensitivities.includes(sensitivity)}
                        onCheckedChange={() => toggleSensitivity(sensitivity)}
                      />
                      <label
                        htmlFor={`sensitivity-${sensitivity}`}
                        className="text-sm cursor-pointer"
                      >
                        {sensitivity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {userType === 'individual' && (
                <div className="space-y-3">
                  <Label>Preferred Activities</Label>
                  <p className="text-sm text-muted-foreground">
                    Get activity recommendations based on weather
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ACTIVITY_OPTIONS.map(activity => (
                      <div key={activity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`activity-${activity}`}
                          checked={preferredActivities.includes(activity)}
                          onCheckedChange={() => toggleActivity(activity)}
                        />
                        <label
                          htmlFor={`activity-${activity}`}
                          className="text-sm cursor-pointer"
                        >
                          {activity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="bg-gradient-to-r from-sky-600 to-blue-600 hover:opacity-90 transition-opacity"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
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
