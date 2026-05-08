import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (!token || !role) {
      toast.error("Authentication failed");
      navigate("/login");
      return;
    }

    // Save token to localStorage
    localStorage.setItem("accessToken", token);

    // Use environment variable or fallback
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    // Fetch user data
    fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user data");
        return res.json();
      })
      .then((userData) => {
        setUser(userData);
        toast.success("Successfully logged in with Google!");
        navigate(role === "candidate" ? "/candidate/jobs" : "/hr/dashboard");
      })
      .catch((error) => {
        console.error("Auth error:", error);
        toast.error("Failed to complete authentication");
        navigate("/login");
      });
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}