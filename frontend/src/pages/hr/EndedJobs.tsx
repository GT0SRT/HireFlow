import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const dummyEnded = [
  {
    _id: "job3",
    title: "Junior QA Engineer",
    company: "Gamma Inc",
    isActive: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    closedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    applicants: [
      { id: "a4", name: "Neha Patel", status: "Rejected" },
      { id: "a5", name: "Vikram Singh", status: "Selected" },
    ],
  },
];

export default function EndedJobs() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Ended Openings</h1>
          <p className="text-sm text-muted-foreground">Recently closed job postings</p>
        </div>
        <Link to="/hr/dashboard" className="text-sm text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {dummyEnded.map((job) => (
          <Link
            to={`/hr/jobs/${job._id}`}
            key={job._id}
            className="group block glass p-4 rounded-2xl border border-border/30 hover:border-primary/40 hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{job.title}</h2>
                <p className="text-sm text-muted-foreground">{job.company}</p>
                <p className="text-xs text-muted-foreground mt-2">Closed {new Date(job.closedAt).toLocaleDateString()}</p>
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
