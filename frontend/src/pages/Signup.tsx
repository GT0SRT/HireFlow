import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Signup() {
  const [role, setRole] = useState<"candidate" | "hr">("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { theme, toggle } = useTheme();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(name, email, password, role, role === "hr" ? company : undefined);
      toast.success("Account created successfully!");
      navigate(role === "candidate" ? "/candidate/jobs" : "/hr/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <button
        onClick={toggle}
        className="absolute top-6 right-6 p-2 rounded-lg hover:bg-muted transition-colors"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="glass rounded-2xl p-8 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold">HireFlow</span>
        </div>

        <h1 className="text-2xl font-display font-bold text-center mb-2">Create account</h1>
        <p className="text-muted-foreground text-center mb-8">Join HireFlow today</p>

        {/* Role Toggle */}
        <div className="flex rounded-xl bg-muted p-1 mb-6">
          {(["candidate", "hr"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                role === r
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r === "candidate" ? "I am a Candidate" : "I am HR/Admin"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              className="mt-1.5 glass"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1.5 glass"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* HR ke liye Company field */}
          {role === "hr" && (
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="TechCorp"
                className="mt-1.5 glass"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className="glass pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full glow-primary-sm"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}