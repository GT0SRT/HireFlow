import { Link } from "react-router-dom";
import { Zap, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export function Navbar() {
  const { theme, toggle } = useTheme();

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <Zap className="h-6 w-6 text-primary" />
          <span>HireFlow</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-muted transition-colors">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="glow-primary-sm">Sign Up</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
