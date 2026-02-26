import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Briefcase, Users, FileCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateJobWizard from "@/components/hr/CreateJobWizard";

const stats = [
  { label: "Active Jobs", value: "12", icon: Briefcase, change: "+3 this week" },
  { label: "Total Applicants", value: "248", icon: Users, change: "+42 this week" },
  { label: "Interviews", value: "18", icon: FileCheck, change: "6 today" },
  { label: "Hire Rate", value: "34%", icon: TrendingUp, change: "+5% this month" },
];

const recentJobs = [
  { id: 1, title: "Senior Frontend Developer", applicants: 45, status: "Active", posted: "2 days ago" },
  { id: 2, title: "ML Engineer", applicants: 32, status: "Active", posted: "3 days ago" },
  { id: 3, title: "Product Designer", applicants: 28, status: "Closed", posted: "1 week ago" },
  { id: 4, title: "Backend Engineer", applicants: 56, status: "Active", posted: "5 days ago" },
];

export default function Dashboard() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your recruitment pipeline</p>
        </div>
        <Button className="glow-primary gap-2 w-full sm:w-auto" onClick={() => setWizardOpen(true)}>
          <Plus className="h-4 w-4" />
          Create New Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((s, i) => (
          <div key={s.label} className="glass rounded-2xl p-6 glass-hover animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
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
        <div className="space-y-4">
          {recentJobs.map(job => (
            <Link key={job.id} to={`/hr/jobs/${job.id}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.applicants} applicants · {job.posted}</p>
              </div>
              <Badge variant={job.status === "Active" ? "default" : "secondary"} className={job.status === "Active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}>
                {job.status}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {wizardOpen && <CreateJobWizard onClose={() => setWizardOpen(false)} />}
    </div>
  );
}
