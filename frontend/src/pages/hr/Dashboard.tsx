import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Building2, FileCheck, Globe, Mail, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateJobWizard from "@/components/hr/CreateJobWizard";
import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Job {
  _id: string;
  title: string;
  isActive: boolean;
  createdAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
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
  const profileFields = [
    user?.company,
    user?.companyProfile?.industry,
    user?.companyProfile?.location,
    user?.companyProfile?.website,
    user?.companyProfile?.hiringEmail,
    user?.companyProfile?.about,
  ].filter(Boolean).length;
  const profileCompletion = Math.round((profileFields / 6) * 100);

  const stats = [
    { label: "Active Jobs", value: activeJobs.toString(), icon: Briefcase, change: "Live postings" },
    { label: "Applicants", value: "—", icon: Users, change: "Across all jobs" },
    { label: "Interviews", value: "—", icon: FileCheck, change: "Scheduled" },
  ];

  return (
    <div>
      <div className="grid mt-14 md:mt-1 gap-4 lg:grid-cols-[1.3fr_0.9fr] mb-5 md:mb-6">
        <div className="glass rounded-2xl p-5 md:p-6 animate-fade-in">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary/80">HR Dashboard</p>
              <h1 className="mt-2 text-2xl md:text-3xl font-display font-bold">Recruitment at a glance</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
                Keep active jobs, hiring status, and company details in one place without the extra clutter.
              </p>
            </div>
            <Button variant="outline" className="gap-2 w-full bg-primary text-primary-foreground sm:w-auto" onClick={() => setWizardOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Job
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 mt-5 sm:grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-1">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="glass rounded-2xl p-2 md:p-3 glass-hover animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-4.5 w-4.5 text-primary" />
                  </div>                
                  <p className="text-xl md:text-2xl font-display font-bold leading-none">{s.value}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                <p className="text-xs text-primary mt-1">{s.change}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 md:p-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary/80">Company Snapshot</p>
              <h2 className="mt-2 text-xl font-display font-semibold">{user?.company || "Add company details"}</h2>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>{user?.companyProfile?.website || "Website not added"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user?.companyProfile?.hiringEmail || "Hiring email not added"}</span>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/40 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Profile completeness</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
            <Link to="/hr/profile" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              Edit company profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      

      {/* Recent Jobs */}
      <div className="glass rounded-2xl p-5 md:p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-display font-semibold">Recent Job Postings</h2>
            <p className="text-sm text-muted-foreground">A compact view of your latest openings</p>
          </div>
        </div>

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
          <div className="space-y-3">
            {recentJobs.map(job => (
              <Link
                key={job._id}
                to={`/hr/jobs/${job._id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Briefcase className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm md:text-base">{job.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
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