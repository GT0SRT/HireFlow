import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CandidateLayout from "./components/CandidateLayout";
import JobBoard from "./pages/candidate/JobBoard";
import MyApplications from "./pages/candidate/MyApplications";
import Profile from "./pages/candidate/Profile";
import HRLayout from "./components/HRLayout";
import Dashboard from "./pages/hr/Dashboard";
import JobDetail from "./pages/hr/JobDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/candidate" element={<CandidateLayout />}>
              <Route path="jobs" element={<JobBoard />} />
              <Route path="applications" element={<MyApplications />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="/hr" element={<HRLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="jobs/:jobId" element={<JobDetail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;