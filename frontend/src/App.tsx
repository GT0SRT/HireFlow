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
import CandidateJobDetail from "./pages/candidate/JobDetail";
import MyApplications from "./pages/candidate/MyApplications";
import Profile from "./pages/candidate/Profile";
import HRLayout from "./components/HRLayout";
import Dashboard from "./pages/hr/Dashboard";
import JobDetail from "./pages/hr/JobDetail";
import CandidateDetail from "./pages/hr/CandidateDetail";
import JobsList from "./pages/hr/JobsList";
import EndedJobs from "./pages/hr/EndedJobs";
import HRProfile from "./pages/hr/Profile";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/candidate"
                element={
                  <ProtectedRoute allowedRole="candidate">
                    <CandidateLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="jobs" element={<JobBoard />} />
                <Route path="jobs/:id" element={<CandidateJobDetail />} />
                <Route path="applications" element={<MyApplications />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="/jobs" element={<JobBoard />} />
              <Route path="/jobs/:id" element={<CandidateJobDetail />} />

              <Route
                path="/hr"
                element={
                  <ProtectedRoute allowedRole="hr">
                    <HRLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="jobs" element={<JobsList />} />
                <Route path="jobs/ended" element={<EndedJobs />} />
                <Route path="profile" element={<HRProfile />} />
                <Route path="jobs/:jobId" element={<JobDetail />} />
                <Route path="candidate/:candidateId" element={<CandidateDetail />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;