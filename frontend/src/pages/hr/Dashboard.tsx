import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Briefcase, Users, FileCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateJobWizard from "@/components/hr/CreateJobWizard";
import api from "@/api/api";
import { toast } from "sonner";

interface Job {
  _id: string;
  title: string;
  isActive: boolean;
  createdAt: string;
}

export default function Dashboard() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = () => {
    api.get("/jobs/my-jobs")
      .then(({ data }) => setRecentJobs(data))
      .catch(() => toast.error("Failed to load jobs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  // Stats real jobs se calculate karo
  const activeJobs = recentJobs.filter(j => j.isActive).length;

  const stats = [
    { label: "Active Jobs",       value: activeJobs.toString(), icon: Briefcase,  change: "Live postings" },
    { label: "Total Applicants",  value: "—",                   icon: Users,      change: "Across all jobs" },
    { label: "Interviews",        value: "—",                   icon: FileCheck,  change: "Scheduled" },
    { label: "Hire Rate",         value: "—",                   icon: TrendingUp, change: "This month" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your recruitment pipeline</p>
        </div>
        <Button
          className="glow-primary gap-2 w-full sm:w-auto"
          onClick={() => setWizardOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="glass rounded-2xl p-6 glass-hover animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-xs text-primary mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="glass rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-xl font-display font-semibold mb-6">Recent Job Postings</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No jobs posted yet. Create your first job!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentJobs.map(job => (
              <Link
                key={job._id}
                to={`/hr/jobs/${job._id}`}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={job.isActive ? "default" : "secondary"}
                  className={job.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}
                >
                  {job.isActive ? "Active" : "Closed"}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Job wizard create hone ke baad list refresh ho */}
      {wizardOpen && (
        <CreateJobWizard
          onClose={() => {
            setWizardOpen(false);
            fetchJobs(); // naya job create hone ke baad list update karo
          }}
        />
      )}
    </div>
  );
}