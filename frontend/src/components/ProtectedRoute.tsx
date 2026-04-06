import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface Props {
  children: React.ReactNode;
  allowedRole: "candidate" | "hr";
}

export default function ProtectedRoute({ children, allowedRole }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allowedRole) {
    return <Navigate to={user.role === "hr" ? "/hr/dashboard" : "/candidate/jobs"} replace />;
  }

  return <>{children}</>;
}