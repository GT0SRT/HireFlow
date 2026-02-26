import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/lib/theme";

export default function Signup() {
  const [role, setRole] = useState<"candidate" | "hr">("candidate");
  const [showPw, setShowPw] = useState(false);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(role === "candidate" ? "/candidate/jobs" : "/hr/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <button onClick={toggle} className="absolute top-6 right-6 p-2 rounded-lg hover:bg-muted transition-colors">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <div className="glass rounded-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold">HireFlow</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-center mb-2">Create account</h1>
        <p className="text-muted-foreground text-center mb-8">Join HireFlow today</p>

        <div className="flex rounded-xl bg-muted p-1 mb-6">
          {(["candidate", "hr"] as const).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                role === r ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r === "candidate" ? "I am a Candidate" : "I am HR/Admin"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" className="mt-1.5 glass" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" className="mt-1.5 glass" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••" className="glass pr-10" required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full glow-primary-sm">Create Account</Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
