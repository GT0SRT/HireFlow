import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Eye,
  UserCheck,
  Star,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/api/api";
import { toast } from "sonner";

type ApplicationStatus =
  | "Applied"
  | "Assessment Pending"
  | "Interview Scheduled"
  | "Selected"
  | "Rejected";

export interface JobDescription {
  primary_role?: string;
  job_summary?: string;
  experience_years?: string;
  mandatory_technical_skills?: string[];
  nice_to_have_skills?: string[];
  soft_skills?: string[];
  key_responsibilities?: string[];
  requirements?: string[];
  assessment_plan?: {
    test_type: string;
    focus_topics: string[];
    suggested_duration_minutes: number;
  }[];
  interview_plan?: { interview_round: string; focus_topics: string[] }[];
}

interface JobDetailData {
  _id: string;
  title: string;
  company: string;
  isActive: boolean;
  createdAt: string;
  job_description?: JobDescription;
}

interface Applicant {
  _id: string;
  status: ApplicationStatus;
  createdAt: string;
  notes?: string;
  screening?: {
    atsScore?: number;
  };
  assessmentScore?: number;
  interviewScore?: number;
  assessment?: { score?: number }[];
  assessments?: { score?: number }[];
  interviews?: { score?: number }[];
  candidate: {
    _id: string;
    name: string;
    email: string;
    skills?: string[];
    resume?: string;
  };
}

const statusColor: Record<string, string> = {
  Applied: "bg-muted text-muted-foreground",
  "Assessment Pending": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Interview Scheduled": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Selected: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const scoreColor = (score?: number | null) => {
  if (score == null) return "text-muted-foreground";
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  return "text-destructive";
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
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to load job details";
      toast.error(message);
      navigate("/hr/dashboard");
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
      const { data } = await api.put(`/jobs/${jobId}`, {
        isActive: !job.isActive,
      });
      setJob(data);
      toast.success(`Job marked as ${data.isActive ? "active" : "closed"}`);
    } catch {
      toast.error("Failed to update job");
    } finally {
      setUpdatingJob(false);
    }
  };

  const deleteJob = async () => {
    if (!jobId) return;
    if (!window.confirm("Delete this job posting? This cannot be undone."))
      return;
    try {
      setUpdatingJob(true);
      await api.delete(`/jobs/${jobId}`);
      toast.success("Job deleted");
      navigate("/hr/dashboard");
    } catch {
      toast.error("Failed to delete job");
    } finally {
      setUpdatingJob(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );

  if (!job) return null;

  // ── Stats calculate karo real data se ───────────────────────
  const selectedCount = applicants.filter(
    (a) => a.status === "Selected",
  ).length;
  const rejectedCount = applicants.filter(
    (a) => a.status === "Rejected",
  ).length;
  const inProgressCount = applicants.length - selectedCount - rejectedCount;

  const enrichedApplicants = applicants.map(app => {
    let aScore = app.assessmentScore;
    if (aScore == null) {
      const arr = app.assessment || app.assessments || [];
      const scored = arr.filter((x: any) => x.score != null);
      if (scored.length) aScore = Math.round(scored.reduce((acc, curr) => acc + curr.score!, 0) / scored.length);
    }
    
    let iScore = app.interviewScore;
    if (iScore == null) {
      const arr = app.interviews || [];
      const scored = arr.filter((x: any) => x.score != null);
      if (scored.length) iScore = Math.round(scored.reduce((acc, curr) => acc + curr.score!, 0) / scored.length);
    }
    
    return { ...app, computedAssessmentScore: aScore, computedInterviewScore: iScore };
  });

  const stats = [
    { label: "Total Applicants", value: applicants.length, icon: Users },
    { label: "In Progress", value: inProgressCount, icon: Clock },
    { label: "Selected", value: selectedCount, icon: CheckCircle2 },
    { label: "Rejected", value: rejectedCount, icon: XCircle },
  ];

  return (
    <div>
      {/* ── Header ──────────────────────────────────────── */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              {job.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {job.company} · Posted{" "}
              {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={
                job.isActive
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-muted text-muted-foreground"
              }
            >
              {job.isActive ? "Active" : "Closed"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/jobs/${job._id}`);
                toast.success("Public job link copied to clipboard!");
              }}
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleJobStatus}
              disabled={updatingJob}
            >
              {job.isActive ? "Close Job" : "Reopen Job"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteJob}
              disabled={updatingJob}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>

        {/* Job Description Structured View */}
        {job.job_description ? (
          <div className="mt-6 glass rounded-xl p-6 space-y-6 text-left">
            <div>
              <h3 className="text-xl font-bold mb-2">Job Summary</h3>
              <p className="text-muted-foreground">
                {job.job_description.job_summary || "No summary provided."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Experience Required</h4>
                <p className="text-sm text-muted-foreground">
                  {job.job_description.experience_years || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Mandatory Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.job_description.mandatory_technical_skills?.map(
                    (skill) => (
                      <Badge key={skill} variant="default">
                        {skill}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Key Responsibilities</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {job.job_description.key_responsibilities?.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Requirements</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {job.job_description.requirements?.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* HR Only - Visible if not stripped by backend */}
            {job.job_description.assessment_plan?.length ||
            job.job_description.interview_plan?.length ? (
              <div className="mt-6 border-t border-border/50 pt-6">
                <h3 className="text-lg font-bold mb-4 text-amber-500 flex items-center gap-2">
                  <Star className="h-5 w-5" /> HR Internal Plans
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {job.job_description.assessment_plan && (
                    <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                      <h4 className="font-semibold text-amber-600 mb-2">
                        Assessment Plan
                      </h4>
                      <ul className="space-y-3">
                        {job.job_description.assessment_plan.map((test, i) => (
                          <li key={i} className="text-sm">
                            <strong>{test.test_type}</strong> (
                            {test.suggested_duration_minutes}m)
                            <div className="text-muted-foreground mt-1">
                              {Array.isArray(test.focus_topics)
                                ? test.focus_topics.join(", ")
                                : test.focus_topics}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {job.job_description.interview_plan && (
                    <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                      <h4 className="font-semibold text-blue-600 mb-2">
                        Interview Plan
                      </h4>
                      <ul className="space-y-3">
                        {job.job_description.interview_plan.map((round, i) => (
                          <li key={i} className="text-sm">
                            <strong>{round.interview_round}</strong>
                            <div className="text-muted-foreground mt-1">
                              {Array.isArray(round.focus_topics)
                                ? round.focus_topics.join(", ")
                                : round.focus_topics}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 glass rounded-xl p-4 text-center text-muted-foreground">
            No job description details available.
          </div>
        )}
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="glass rounded-2xl p-4 md:p-6 animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xl md:text-2xl font-display font-bold">
              {s.value}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Applicants Table ───────────────────────────────── */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-display font-semibold">
            Applicants
            <span className="ml-2 text-sm text-muted-foreground font-normal">
              ({applicants.length})
            </span>
          </h2>
        </div>

        {applicants.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No applications yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Candidate
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Resume
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Assessment
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Interview
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Applied
                    </th>
                    {/* ← View Profile column */}
                    <th className="text-left p-4 font-medium text-muted-foreground">
                      Profile
                    </th>
                  </tr>
                </thead>
                <tbody>
                {enrichedApplicants.map((applicant) => (
                    <tr
                      key={applicant._id}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-medium">
                          {applicant.candidate?.name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {applicant.candidate?.email || "—"}
                        </p>
                        {/* Skills preview */}
                        {applicant.candidate?.skills &&
                          applicant.candidate.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {applicant.candidate.skills
                                .slice(0, 2)
                                .map((s) => (
                                  <span
                                    key={s}
                                    className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                                  >
                                    {s}
                                  </span>
                                ))}
                              {applicant.candidate.skills.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{applicant.candidate.skills.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                      </td>

                      <td className="p-4">
                        <Badge
                          className={
                            statusColor[applicant.status] ||
                            "bg-muted text-muted-foreground"
                          }
                        >
                          {applicant.status}
                        </Badge>
                      </td>

                      <td
                        className={`p-4 font-semibold ${scoreColor(
                          applicant.screening?.atsScore,
                        )}`}
                      >
                      {applicant.screening?.atsScore != null
                          ? `${applicant.screening.atsScore}%`
                          : "—"}
                      </td>

                      <td
                      className={`p-4 font-semibold ${scoreColor(applicant.computedAssessmentScore)}`}
                      >
                      {applicant.computedAssessmentScore != null
                        ? `${applicant.computedAssessmentScore}%`
                          : "—"}
                      </td>

                      <td
                      className={`p-4 font-semibold ${scoreColor(applicant.computedInterviewScore)}`}
                      >
                      {applicant.computedInterviewScore != null
                        ? `${applicant.computedInterviewScore}%`
                          : "—"}
                      </td>

                      <td className="p-4 text-muted-foreground text-xs">
                        {new Date(applicant.createdAt).toLocaleDateString()}
                      </td>

                      {/* ← VIEW PROFILE BUTTON */}
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs"
                          onClick={() =>
                            navigate(`/hr/candidate/${applicant.candidate._id}`, { state: { application: applicant, job: job } })
                          }
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border/30">
              {enrichedApplicants.map((applicant) => (
                <div key={applicant._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {applicant.candidate?.name || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {applicant.candidate?.email || "—"}
                      </p>
                    </div>
                    <Badge
                      className={`shrink-0 ${statusColor[applicant.status] || ""}`}
                    >
                      {applicant.status}
                    </Badge>
                  </div>

                  <div className="flex gap-4 text-xs">
                    <span className={scoreColor(applicant.screening?.atsScore)}>
                      Resume:{" "}
                      {applicant.screening?.atsScore != null
                        ? `${applicant.screening.atsScore}%`
                        : "—"}
                    </span>
                    <span className={scoreColor(applicant.computedAssessmentScore)}>
                      Assessment:{" "}
                      {applicant.computedAssessmentScore != null
                        ? `${applicant.computedAssessmentScore}%`
                        : "—"}
                    </span>
                    <span className={scoreColor(applicant.computedInterviewScore)}>
                      Interview:{" "}
                      {applicant.computedInterviewScore != null
                        ? `${applicant.computedInterviewScore}%`
                        : "—"}
                    </span>
                  </div>

                  {/* ← VIEW PROFILE BUTTON (mobile) */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-2 text-xs"
                    onClick={() =>
                      navigate(`/hr/candidate/${applicant.candidate._id}`, { state: { application: applicant, job: job } })
                    }
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Candidate Profile
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
