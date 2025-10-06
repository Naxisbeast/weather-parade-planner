import { Link, useLocation } from "react-router-dom";
import { Cloud, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-sky group-hover:scale-110 transition-transform">
              <Cloud className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Will It Rain?
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="flex gap-6">
              <Link
                to="/"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === "/" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Dashboard
              </Link>
              <Link
                to="/calendar"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === "/calendar" ? "text-primary" : "text-muted-foreground"
                )}
              >
                Calendar
              </Link>
              <Link
                to="/about"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === "/about" ? "text-primary" : "text-muted-foreground"
                )}
              >
                About
              </Link>
            </div>

            <div className="flex items-center gap-2 border-l pl-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
