import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, User } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, removeFavorite } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id);
    toast.success("Favorite removed");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Profile
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account and saved queries
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="text-lg font-medium">{user.username}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Saved Queries ({user.favorites.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {user.favorites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No saved queries yet</p>
                  <p className="text-sm mt-2">
                    Start analyzing weather and save your favorite queries from the dashboard
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{favorite.location}</h3>
                          <Badge variant="secondary">{favorite.date}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {favorite.conditions.map((condition) => (
                            <Badge key={condition} variant="outline" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Saved {new Date(favorite.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
