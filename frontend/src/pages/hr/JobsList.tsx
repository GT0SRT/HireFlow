import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/api/api";
import { toast } from "sonner";

interface Applicant {
  status?: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  isActive: boolean;
  createdAt: string;
  applicants?: Applicant[];
}

export default function JobsList() {
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/jobs/my-jobs")
      .then(({ data }) => {
        const active = data.filter((j: Job) => j.isActive);
        setActiveJobs(active);
      })
      .catch(() => toast.error("Failed to load current openings"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Current Openings</h1>
          <p className="text-sm text-muted-foreground">All active job postings</p>
        </div>
        <Link to="/hr/dashboard" className="text-sm text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>

      {activeJobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground glass rounded-2xl">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No current openings found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeJobs.map((job) => {
            const applicantsCount = job.applicants?.length || 0;
            const selectedCount = job.applicants?.filter(a => a.status === "Selected" || a.status === "Offered").length || 0;
            const rejectedCount = job.applicants?.filter(a => a.status === "Rejected").length || 0;

            return (
              <Link
                to={`/hr/jobs/${job._id}`}
                key={job._id}
                className="group block glass p-4 rounded-2xl border border-border/30 hover:border-primary/40 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold group-hover:glow-primary-sm">{job.title}</h2>
                    <p className="text-sm text-muted-foreground">{job.company || "Your Company"}</p>
                    <p className="text-xs text-muted-foreground mt-2">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">{applicantsCount} applicants</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 items-center text-sm">
                  <Badge className="bg-muted/30">{applicantsCount} applicants</Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    {selectedCount} selected
                  </Badge>
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                    {rejectedCount} rejected
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">{job.isActive ? "Active" : "Closed"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
