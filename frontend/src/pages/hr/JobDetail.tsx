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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/api/api";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────
// 🚧 DUMMY DATA FLAG
// Jab real backend ready ho jaye to bas ye ek line false karo:
// const USE_DUMMY_DATA = false;
// ─────────────────────────────────────────────────────────────
const USE_DUMMY_DATA = false;

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
  candidate: {
    _id: string;
    name: string;
    email: string;
    skills?: string[];
    resume?: string;
  };
}

// ─── Dummy Data (sirf USE_DUMMY_DATA=true tab use hoga) ──────
const DUMMY_JOB: JobDetailData = {
  _id: "dummy-job-1",
  title: "Senior Frontend Engineer",
  company: "Acme Corp",
  isActive: true,
  createdAt: new Date().toISOString(),
  job_description: {
    job_summary:
      "Build user-facing features with React/TypeScript. Collaborate with design and backend teams.",
    experience_years: "3-5 years",
    mandatory_technical_skills: ["React", "TypeScript", "Tailwind CSS"],
    key_responsibilities: ["Develop scalable components", "Mentor juniors"],
    requirements: [
      "Strong UI architecture experience",
      "Comfort with design systems",
    ],
    assessment_plan: [
      {
        test_type: "Coding",
        focus_topics: ["React components", "TypeScript patterns"],
        suggested_duration_minutes: 60,
      },
    ],
    interview_plan: [
      {
        interview_round: "Technical",
        focus_topics: ["Frontend architecture", "State management"],
      },
    ],
  },
};

const DUMMY_APPLICANTS: Applicant[] = [
  {
    _id: "a1",
    status: "Interview Scheduled",
    resumeScore: 85,
    assessmentScore: 78,
    interviewScore: 82,
    createdAt: new Date().toISOString(),
    candidate: {
      _id: "c1",
      name: "Aarav Sharma",
      email: "aarav@example.com",
      skills: ["React", "TypeScript", "Tailwind CSS"],
    },
  },
  {
    _id: "a2",
    status: "Assessment Pending",
    resumeScore: 72,
    assessmentScore: 69,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    notes: "Strong resume. Awaiting assessment completion.",
    candidate: {
      _id: "c2",
      name: "Priya Patel",
      email: "priya@example.com",
      skills: ["Node.js", "Express", "MongoDB"],
    },
  },
  {
    _id: "a3",
    status: "Rejected",
    resumeScore: 45,
    assessmentScore: 38,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    candidate: {
      _id: "c3",
      name: "Neha Patel",
      email: "neha@example.com",
    },
  },
];
// ─── Dummy Data End ──────────────────────────────────────────

const statusColor: Record<string, string> = {
  Applied: "bg-muted text-muted-foreground",
  "Assessment Pending": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Interview Scheduled": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Selected: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const scoreColor = (score?: number) => {
  if (!score) return "text-muted-foreground";
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

    // ── Dummy mode ──────────────────────────────────────────
    if (USE_DUMMY_DATA) {
      setJob(DUMMY_JOB);
      setApplicants(DUMMY_APPLICANTS);
      setLoading(false);
      return;
    }
    // ── Real API mode (USE_DUMMY_DATA = false hone par) ─────
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
    if (USE_DUMMY_DATA) {
      setJob((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev));
      toast.success("Job status updated (demo)");
      return;
    }
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
    if (USE_DUMMY_DATA) {
      toast.success("Job deleted (demo)");
      navigate("/hr/dashboard");
      return;
    }
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

  // Average scores
  const withResume = applicants.filter((a) => a.screening?.atsScore);
  const withAssessment = applicants.filter((a) => a.assessmentScore);
  const withInterview = applicants.filter((a) => a.interviewScore);

  const avg = (arr: Applicant[], key: keyof Applicant) =>
    arr.length
      ? Math.round(arr.reduce((s, a) => s + (a[key] as number), 0) / arr.length)
      : null;
  const avgResume = withResume.length
  ? Math.round(
      withResume.reduce(
        (sum, a) => sum + (a.screening?.atsScore || 0),
        0
      ) / withResume.length
    )
  : null;
  const avgAssessment = avg(withAssessment, "assessmentScore");
  const avgInterview = avg(withInterview, "interviewScore");

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

      {/* ── Avg Score Cards ────────────────────────────────── */}
      {applicants.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Avg Resume Score", value: avgResume },
            { label: "Avg Assessment Score", value: avgAssessment },
            { label: "Avg Interview Score", value: avgInterview },
          ].map((item) => (
            <div key={item.label} className="glass rounded-2xl p-4 text-center">
              <p
                className={`text-2xl font-display font-bold ${scoreColor(item.value ?? 0)}`}
              >
                {item.value !== null ? `${item.value}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Applicants Table ───────────────────────────────── */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-display font-semibold">
            Applicants
            <span className="ml-2 text-sm text-muted-foreground font-normal">
              ({applicants.length})
            </span>
          </h2>
          {USE_DUMMY_DATA && (
            <Badge
              variant="outline"
              className="text-xs text-amber-500 border-amber-500/30"
            >
              Demo Mode
            </Badge>
          )}
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
                  {applicants.map((applicant) => (
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
                        {applicant.screening?.atsScore
                          ? `${applicant.screening.atsScore}%`
                          : "—"}
                      </td>

                      <td
                        className={`p-4 font-semibold ${scoreColor(applicant.assessmentScore)}`}
                      >
                        {applicant.assessmentScore
                          ? `${applicant.assessmentScore}%`
                          : "—"}
                      </td>

                      <td
                        className={`p-4 font-semibold ${scoreColor(applicant.interviewScore)}`}
                      >
                        {applicant.interviewScore
                          ? `${applicant.interviewScore}%`
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
                            navigate(`/hr/candidate/${applicant.candidate._id}`)
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
              {applicants.map((applicant) => (
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
                      {applicant.screening?.atsScore
                        ? `${applicant.screening.atsScore}%`
                        : "—"}
                    </span>
                    <span className={scoreColor(applicant.assessmentScore)}>
                      Assessment:{" "}
                      {applicant.assessmentScore
                        ? `${applicant.assessmentScore}%`
                        : "—"}
                    </span>
                    <span className={scoreColor(applicant.interviewScore)}>
                      Interview:{" "}
                      {applicant.interviewScore
                        ? `${applicant.interviewScore}%`
                        : "—"}
                    </span>
                  </div>

                  {/* ← VIEW PROFILE BUTTON (mobile) */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-2 text-xs"
                    onClick={() =>
                      navigate(`/hr/candidate/${applicant.candidate._id}`)
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
