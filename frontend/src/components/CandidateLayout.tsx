import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Zap, Briefcase, FileText, User, Sun, Moon, LogOut, Menu, X } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const links = [
  { to: "/candidate/jobs", label: "Job Board", icon: Briefcase },
  { to: "/candidate/applications", label: "My Applications", icon: FileText },
  { to: "/candidate/profile", label: "Profile", icon: User },
];

export default function CandidateLayout() {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 glass flex items-center justify-between h-14 px-4 md:hidden">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <Zap className="h-5 w-5 text-primary" />
          HireFlow
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static z-50 top-0 left-0 h-full w-64 border-r glass flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <Zap className="h-5 w-5 text-primary" />
            HireFlow
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Candidate Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                pathname === l.to
                  ? "bg-primary/10 text-primary glow-primary-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border/50 space-y-2">
          <button onClick={toggle} className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all w-full">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <Link to="/login" className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 pt-18 md:p-8 md:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
