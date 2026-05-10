import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";
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
  updatedAt?: string;
  applicants?: Applicant[];
}

export default function EndedJobs() {
  const [endedJobs, setEndedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/jobs/my-jobs")
      .then(({ data }) => {
        const inactive = data.filter((j: Job) => !j.isActive);
        setEndedJobs(inactive);
      })
      .catch(() => toast.error("Failed to load ended jobs"))
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
      <div className="flex items-center justify-between mb-6 mt-14 md:mt-1">
        <div>
          <h1 className="text-2xl font-display font-bold">Ended Openings</h1>
          <p className="text-sm text-muted-foreground">Recently closed job postings</p>
        </div>
        <Link to="/hr/dashboard" className="text-sm text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>

      {endedJobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground glass rounded-2xl">
          <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No ended jobs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {endedJobs.map((job) => {
            const applicantsCount = job.applicants?.length || 0;
            const selectedCount = job.applicants?.filter(a => a.status === "Selected" || a.status === "Offered").length || 0;
            const rejectedCount = job.applicants?.filter(a => a.status === "Rejected").length || 0;

            return (
              <Link
                to={`/hr/jobs/${job._id}`}
                key={job._id}
                className="group block glass p-4 rounded-2xl border border-border/30 hover:border-primary/40 hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{job.title}</h2>
                    <p className="text-sm text-muted-foreground">{job.company || "Your Company"}</p>
                    <p className="text-xs text-muted-foreground mt-2">Closed {new Date(job.updatedAt || job.createdAt).toLocaleDateString()}</p>
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
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
