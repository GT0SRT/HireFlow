import { Link } from "react-router-dom";
import { Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const dummyJobs = [
  {
    _id: "job1",
    title: "Senior Frontend Engineer",
    company: "Acme Corp",
    isActive: true,
    createdAt: new Date().toISOString(),
    applicants: [
      { id: "a1", name: "Rajan Sharma", status: "Interview Scheduled" },
      { id: "a2", name: "Anita Verma", status: "Applied" },
    ],
  },
  {
    _id: "job2",
    title: "Backend Engineer (Node.js)",
    company: "Beta Labs",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    applicants: [
      { id: "a3", name: "Suresh Gupta", status: "Assessment Pending" },
    ],
  },
];

export default function JobsList() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dummyJobs.map((job) => (
          <Link
            to={`/hr/jobs/${job._id}`}
            key={job._id}
            className="group block glass p-4 rounded-2xl border border-border/30 hover:border-primary/40 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold group-hover:glow-primary-sm">{job.title}</h2>
                <p className="text-sm text-muted-foreground">{job.company}</p>
                <p className="text-xs text-muted-foreground mt-2">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">{job.applicants.length} applicants</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 items-center text-sm">
              <Badge className="bg-muted/30">{job.applicants.length} applicants</Badge>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                {job.applicants.filter((a) => a.status === "Selected" || a.status === "Offered").length} selected
              </Badge>
              <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                {job.applicants.filter((a) => a.status === "Rejected").length} rejected
              </Badge>
              <span className="ml-auto text-xs text-muted-foreground">{job.isActive ? "Active" : "Closed"}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
