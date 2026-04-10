import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/api/api";


interface User {
  _id: string;
  name: string;
  email: string;
  role: "candidate" | "hr";
  company?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string, company?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // App open hone par check karo user logged in hai ya nahi
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      api.get("/auth/me")
        .then(({ data }) => setUser(data))
        .catch(() => localStorage.removeItem("accessToken"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", data.accessToken);
    setUser(data);
  };

  const signup = async (name: string, email: string, password: string, role: string, company?: string) => {
    const { data } = await api.post("/auth/register", { name, email, password, role, company });
    localStorage.setItem("accessToken", data.accessToken);
    setUser(data);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};