import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  username: string;
  favorites: SavedQuery[];
}

interface SavedQuery {
  id: string;
  location: string;
  date: string;
  conditions: string[];
  savedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  signup: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  addFavorite: (query: Omit<SavedQuery, "id" | "savedAt">) => void;
  removeFavorite: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy user storage
const USERS_KEY = "weather_app_users";
const CURRENT_USER_KEY = "weather_app_current_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getUsers = (): Record<string, { password: string; favorites: SavedQuery[] }> => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : { testuser: { password: "1234", favorites: [] } };
  };

  const saveUsers = (users: Record<string, { password: string; favorites: SavedQuery[] }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = (username: string, password: string): boolean => {
    const users = getUsers();
    if (users[username] && users[username].password === password) {
      const loggedInUser: User = {
        username,
        favorites: users[username].favorites || []
      };
      setUser(loggedInUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedInUser));
      return true;
    }
    return false;
  };

  const signup = (username: string, password: string): boolean => {
    const users = getUsers();
    if (users[username]) {
      return false; // User already exists
    }
    users[username] = { password, favorites: [] };
    saveUsers(users);
    
    const newUser: User = {
      username,
      favorites: []
    };
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const addFavorite = (query: Omit<SavedQuery, "id" | "savedAt">) => {
    if (!user) return;

    const newFavorite: SavedQuery = {
      ...query,
      id: Date.now().toString(),
      savedAt: new Date().toISOString()
    };

    const updatedUser = {
      ...user,
      favorites: [...user.favorites, newFavorite]
    };

    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    // Update in users storage
    const users = getUsers();
    users[user.username].favorites = updatedUser.favorites;
    saveUsers(users);
  };

  const removeFavorite = (id: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      favorites: user.favorites.filter(f => f.id !== id)
    };

    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    // Update in users storage
    const users = getUsers();
    users[user.username].favorites = updatedUser.favorites;
    saveUsers(users);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        addFavorite,
        removeFavorite
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
