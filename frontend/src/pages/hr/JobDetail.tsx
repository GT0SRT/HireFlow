import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, CheckCircle2, XCircle, Clock, Trash2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/api/api";
import { toast } from "sonner";

type ApplicationStatus =
  | "Applied"
  | "Assessment Pending"
  | "Interview Scheduled"
  | "Rejected";

interface JobDetailData {
  _id: string;
  title: string;
  company: string;
  isActive: boolean;
  createdAt: string;
  description?: string;
}

interface Applicant {
  _id: string;
  status: ApplicationStatus;
  createdAt: string;
  notes?: string;
  resumeScore?: number;
  assessmentScore?: number;
  interviewScore?: number;
  candidate: {
    _id: string;
    name: string;
    email: string;
    skills?: string[];
    resume?: string;
  };
}

// Dummy fallback data for frontend-only demo
const DUMMY_JOBS: Record<string, JobDetailData> = {
  job1: {
    _id: "job1",
    title: "Senior Frontend Engineer",
    company: "Acme Corp",
    isActive: true,
    createdAt: new Date().toISOString(),
    description: "Build user-facing features with React/TypeScript. Collaborate with design and backend teams.",
  },
  job2: {
    _id: "job2",
    title: "Backend Engineer (Node.js)",
    company: "Beta Labs",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    description: "Design and maintain REST APIs, optimize performance, and write tests.",
  },
  job3: {
    _id: "job3",
    title: "Junior QA Engineer",
    company: "Gamma Inc",
    isActive: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    description: "Write test cases, run manual and automated tests, and report bugs.",
  },
};

const DUMMY_APPLICANTS: Record<string, Applicant[]> = {
  job1: [
    { _id: "a1", status: "Interview Scheduled", resumeScore: 85, assessmentScore: 78, interviewScore: 82, createdAt: new Date().toISOString(), candidate: { _id: "c1", name: "Rajan Sharma", email: "rajan@example.com" } },
    { _id: "a2", status: "Applied", resumeScore: 68, assessmentScore: 62, interviewScore: 70, createdAt: new Date().toISOString(), candidate: { _id: "c2", name: "Anita Verma", email: "anita@example.com" } },
  ],
  job2: [
    { _id: "a3", status: "Assessment Pending", resumeScore: 88, assessmentScore: 84, interviewScore: 86, createdAt: new Date().toISOString(), candidate: { _id: "c3", name: "Suresh Gupta", email: "suresh@example.com" } },
  ],
  job3: [
    { _id: "a4", status: "Rejected", resumeScore: 45, assessmentScore: 38, interviewScore: 42, createdAt: new Date().toISOString(), candidate: { _id: "c4", name: "Neha Patel", email: "neha@example.com" } },
    { _id: "a5", status: "Selected", resumeScore: 92, assessmentScore: 90, interviewScore: 95, createdAt: new Date().toISOString(), candidate: { _id: "c5", name: "Vikram Singh", email: "vikram@example.com" } },
  ],
};

const statusColor: Record<ApplicationStatus, string> = {
  Applied: "bg-muted text-muted-foreground",
  "Assessment Pending": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Interview Scheduled": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  // 'Selected' replaces 'Offered'
  Selected: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetailData | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingJob, setUpdatingJob] = useState(false);

  const loadJobData = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const [jobRes, applicationsRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/applications/job/${jobId}`),
      ]);
      setJob(jobRes.data);
      setApplicants(applicationsRes.data);
    } catch (error: unknown) {
      // If backend isn't available, fall back to local dummy data for frontend demo
      if (jobId && DUMMY_JOBS[jobId]) {
        setJob(DUMMY_JOBS[jobId]);
        setApplicants(DUMMY_APPLICANTS[jobId] || []);
      } else {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to load job details";
        toast.error(message);
        navigate("/hr/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const toggleJobStatus = async () => {
    if (!jobId || !job) return;

    try {
      setUpdatingJob(true);
      const { data } = await api.put(`/jobs/${jobId}`, { isActive: !job.isActive });
      setJob(data);
      toast.success(`Job marked as ${data.isActive ? "active" : "closed"}`);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update job";
      toast.error(message);
    } finally {
      setUpdatingJob(false);
    }
  };

  const deleteJob = async () => {
    if (!jobId) return;
    if (!window.confirm("Delete this job posting? This action cannot be undone.")) return;

    try {
      setUpdatingJob(true);
      await api.delete(`/jobs/${jobId}`);
      toast.success("Job deleted");
      navigate("/hr/dashboard");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete job";
      toast.error(message);
    } finally {
      setUpdatingJob(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!job) return null;

  const hiredCount = applicants.filter((a) => a.status === "Selected").length;
  const rejectedCount = applicants.filter((a) => a.status === "Rejected").length;
  const inProgressCount = applicants.length - hiredCount - rejectedCount;

  const stats = [
    { label: "Total Applicants", value: applicants.length, icon: Users },
    { label: "In Progress", value: inProgressCount, icon: Clock },
    { label: "Selected", value: hiredCount, icon: CheckCircle2 },
    { label: "Rejected", value: rejectedCount, icon: XCircle },
  ];

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/hr/jobs"))}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">{job.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {job.company} · Posted {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2">
            <Badge
              className={
                job.isActive
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-muted text-muted-foreground"
              }
            >
              {job.isActive ? "Active" : "Closed"}
            </Badge>
            <Button variant="outline" onClick={toggleJobStatus} disabled={updatingJob}>
              {job.isActive ? "Close Job" : "Reopen Job"}
            </Button>
            <Button variant="destructive" onClick={deleteJob} disabled={updatingJob}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
        {/* Job description dropdown */}
        <details className="mt-6 glass rounded-xl p-4">
          <summary className="cursor-pointer font-medium">Job description</summary>
          <div className="mt-3 text-sm text-muted-foreground">
            {job.description || DUMMY_JOBS[jobId || ""]?.description || "No description provided."}
          </div>
        </details>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="glass rounded-2xl p-4 md:p-6 animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xl md:text-2xl font-display font-bold">{s.value}</p>
            <p className="text-xs md:text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {applicants.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No applications yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Candidate</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Resume Score</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Assessment Score</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Interview Score</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => {
                  const avgScore = applicant.resumeScore && applicant.assessmentScore && applicant.interviewScore
                    ? Math.round((applicant.resumeScore + applicant.assessmentScore + applicant.interviewScore) / 3)
                    : 0;
                  
                  const scoreColor = (score?: number) => {
                    if (!score) return "text-muted-foreground";
                    return score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-destructive";
                  };

                  return (
                    <tr
                      key={applicant._id}
                      onClick={() => navigate(`/hr/candidate/${applicant.candidate._id}`)}
                      className="border-b border-border/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <p className="font-medium">{applicant.candidate?.name || "Candidate"}</p>
                        <p className="text-xs text-muted-foreground">{applicant.candidate?.email || "No email"}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColor[applicant.status] || "bg-muted text-muted-foreground"}>
                          {applicant.status}
                        </Badge>
                      </td>
                      <td className={`p-4 font-semibold ${scoreColor(applicant.resumeScore)}`}>
                        {applicant.resumeScore ? `${applicant.resumeScore}%` : "-"}
                      </td>
                      <td className={`p-4 font-semibold ${scoreColor(applicant.assessmentScore)}`}>
                        {applicant.assessmentScore ? `${applicant.assessmentScore}%` : "-"}
                      </td>
                      <td className={`p-4 font-semibold ${scoreColor(applicant.interviewScore)}`}>
                        {applicant.interviewScore ? `${applicant.interviewScore}%` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
