import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp,
  ClipboardCheck,
  ExternalLink
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import { toast } from "sonner";

interface AssessmentStep {
  testType: string;
  coveredTopics?: string[];
  score?: number;
  threshold?: number;
  completedAt?: string;
  suggestedDurationMinutes?: number;
}

interface InterviewStep {
  interview_round: string;
  focus_topics?: string[];
}

interface ApplicationScreening {
  atsScore?: number | null;
  atsThreshold?: number | null;
  status?: string;
  reasoningForCandidate?: string;
  reasoningForHR?: string;
  missingMandatorySkills?: string[];
  completedAt?: string;
  attempts?: number;
}

interface JobDescription {
  assessment_plan?: Array<{
    test_type: string;
    focus_topics?: string[];
    suggested_duration_minutes?: number;
  }>;
  interview_plan?: InterviewStep[];
}

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: string;
    job_description?: JobDescription;
  };
  status?: string;
  progress?: number;
  notes?: string;
  createdAt: string;
  screening?: ApplicationScreening;
  assessment?: AssessmentStep[];
  assessments?: AssessmentStep[];
  interviews?: InterviewStep[];
  docsVerified?: boolean;
  docsRequired?: string[];
  docsSubmitted?: string[];
  teamAllocated?: string;
  offerAvailable?: boolean;
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  Applied:               { icon: Clock,        color: "bg-muted text-muted-foreground border-border",            label: "Applied" },
  Shortlisted:           { icon: CheckCircle,  color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Shortlisted" },
  "Not Shortlisted":     { icon: AlertCircle,  color: "bg-destructive/10 text-destructive border-destructive/20", label: "Not Shortlisted" },
  "Assessment Pending":  { icon: Clock,        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",      label: "Assessment Pending" },
  "Interview Scheduled": { icon: AlertCircle,  color: "bg-primary/10 text-primary border-primary/20",            label: "Interview Scheduled" },
  Offered:                { icon: CheckCircle,  color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Offered" },
  Rejected:               { icon: AlertCircle,  color: "bg-destructive/10 text-destructive border-destructive/20", label: "Rejected" },
};

const stepStatusStyle: Record<string, string> = {
  completed: "text-emerald-500",
  pending:   "text-amber-500",
  scheduled: "text-primary",
  locked:    "text-muted-foreground opacity-50",
  rejected:  "text-destructive",
};

const stepStatusLabel: Record<string, string> = {
  completed: "Done",
  pending: "Pending",
  scheduled: "Scheduled",
  locked: "Locked",
  rejected: "Screening failed",
};

const formatDate = (dateValue?: string) => {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleDateString();
};

const getApplicationStatus = (app: Application) => {
  if (app.status && app.status !== "Applied") return app.status;
  if (app.screening?.status) return app.screening.status;
  return "Applied";
};

const getStageTone = (status: string) => {
  if (status === "completed") return "border-emerald-500/20 bg-emerald-500/5";
  if (status === "scheduled") return "border-primary/20 bg-primary/5";
  if (status === "pending") return "border-amber-500/20 bg-amber-500/5";
  if (status === "rejected") return "border-destructive/20 bg-destructive/5";
  return "border-border/60 bg-muted/20";
};

const buildJourneyStages = (app: Application) => {
  const screening = app.screening;
  const applicationStatus = getApplicationStatus(app);
  const assessmentPlan = app.assessment || app.job?.job_description?.assessment_plan?.map((step) => ({
    testType: step.test_type,
    coveredTopics: step.focus_topics,
    suggestedDurationMinutes: step.suggested_duration_minutes,
  })) || [];
  const interviewPlan = app.interviews?.length ? app.interviews : app.job?.job_description?.interview_plan || [];

  const stages: Array<{
    key: string;
    title: string;
    detail: string;
    status: keyof typeof stepStatusStyle;
    label: string;
  }> = [
    {
      key: "applied",
      title: "Application Submitted",
      detail: `Applied on ${formatDate(app.createdAt)}`,
      status: "completed",
      label: "Done",
    },
    {
      key: "screening",
      title: "Resume Screening",
      detail: screening
        ? `ATS ${screening.atsScore ?? "N/A"}% · ${screening.status || "Review complete"}`
        : "Waiting for screening to complete",
      status: screening
        ? screening.status === "Not Shortlisted"
          ? "rejected"
          : "completed"
        : "pending",
      label: screening?.status || "Pending",
    },
  ];

  assessmentPlan.forEach((step, index) => {
    const savedStep = app.assessment?.[index];
    const completed = Boolean(savedStep?.score != null || savedStep?.completedAt);
    const locked = screening?.status === "Not Shortlisted" || applicationStatus === "Rejected";
    const stageStatus = completed
      ? "completed"
      : locked
        ? "locked"
        : applicationStatus === "Interview Scheduled" || applicationStatus === "Offered"
          ? "completed"
          : screening?.status === "Shortlisted"
            ? index === 0
              ? "pending"
              : "locked"
            : "locked";

    stages.push({
      key: `assessment-${index}`,
      title: `Assessment ${index + 1}`,
      detail: step.testType || "Assessment stage",
      status: stageStatus,
      label: savedStep?.score != null ? `${savedStep.score}%` : (step.suggestedDurationMinutes ? `${step.suggestedDurationMinutes} min` : stepStatusLabel[stageStatus]),
    });
  });

  interviewPlan.forEach((step, index) => {
    const stageStatus = applicationStatus === "Interview Scheduled" || applicationStatus === "Offered"
      ? "scheduled"
      : screening?.status === "Shortlisted"
        ? "pending"
        : "locked";

    // Show time duration, default to "60 min" if not available
    const labelStr = "60 min";

    stages.push({
      key: `interview-${index}`,
      title: `Interview ${index + 1}`,
      detail: step.interview_round || "Interview stage",
      status: stageStatus,
      label: labelStr,
    });
  });

  stages.push({
    key: "decision",
    title: "Final Decision",
    detail: applicationStatus === "Offered"
      ? "Offer ready"
      : applicationStatus === "Rejected"
        ? "Application closed"
        : "Waiting for the next stage",
    status: applicationStatus === "Offered"
      ? "completed"
      : applicationStatus === "Rejected"
        ? "rejected"
        : applicationStatus === "Interview Scheduled"
          ? "scheduled"
          : "pending",
    label: applicationStatus,
  });

  return stages;
};

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [retryingApplicationId, setRetryingApplicationId] = useState<string | null>(null);

  useEffect(() => {
    api.get("/applications/my")
      .then(({ data }) => setApplications(data))
      .catch(() => toast.error("Failed to load applications"))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: string) =>
    setExpanded(prev => (prev === id ? null : id));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (applications.length === 0) return (
    <div>
      <div className="mb-6 mt-16 md:mt-3 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Track your application progress</p>
      </div>
      <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>No applications yet. Apply to a job first!</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 mt-16 md:mt-3 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Track your application progress</p>
      </div>

      <div className="space-y-4">
        {applications.map((app, i) => {
          const currentStatus = getApplicationStatus(app);
          const st = statusConfig[currentStatus] ?? statusConfig.Applied;
          const isOpen = expanded === app._id;
          const journeyStages = buildJourneyStages(app);

          return (
            <div
              key={app._id}
              className="glass rounded-2xl overflow-hidden animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Header */}
              <button
                onClick={() => toggleExpand(app._id)}
                className="w-full text-left p-4 md:p-6 flex items-center gap-4 md:gap-6 glass-hover transition-colors"
              >
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-base md:text-lg">
                    {app.job?.title ?? "Job"}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {app.job?.company} · Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    <Progress value={app.progress ?? 10} className="h-1.5 md:h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{app.progress ?? 10}% complete</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <Badge variant="outline" className={`hidden sm:inline-flex gap-1.5 ${st.color}`}>
                    <st.icon className="h-3.5 w-3.5" />
                    {st.label}
                  </Badge>
                  {isOpen
                    ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    : <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  }
                </div>
              </button>

              {/* Mobile badge */}
              <div className="sm:hidden px-4 pb-2 -mt-2">
                <Badge variant="outline" className={`gap-1.5 ${st.color}`}>
                  <st.icon className="h-3.5 w-3.5" />
                  {st.label}
                </Badge>
              </div>

              {/* Expanded */}
              {isOpen && (
                <div className="border-t border-border/50 p-4 md:p-6 space-y-6 animate-fade-in">

                  {/* Journey */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        <h4 className="font-display font-semibold text-sm md:text-base">Application Journey</h4>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto gap-2" onClick={() => navigate(`/jobs/${app.job._id}`)}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Job Details
                        </Button>
                        {(() => {
                          if (app.screening?.status !== "Shortlisted" && app.status !== "Interview Scheduled" && app.status !== "Assessment Pending") return null;
                          if (app.status === "Rejected" || app.status === "Offered") return null;

                          const assessments = app.assessment || app.assessments || [];
                          const nextAssessmentIndex = assessments.findIndex((a: AssessmentStep | null) => !a?.score && !a?.completedAt);
                          if (nextAssessmentIndex >= 0) {
                            return (
                              <Button size="sm" className="w-full sm:w-auto glow-primary-sm gap-2" onClick={() => navigate(`/candidate/applications/${app._id}/assessment/${nextAssessmentIndex}`)}>
                                Next Stage: Start Assessment {nextAssessmentIndex + 1}
                              </Button>
                            );
                          }

                          const interviews = app.interviews || [];
                          const nextInterviewIndex = interviews.findIndex((i: InterviewStep) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const status = (i as any)?.status;
                            return !status || status === "pending" || status === "scheduled";
                          });
                          if (nextInterviewIndex >= 0) {
                            return (
                              <Button size="sm" className="w-full sm:w-auto glow-primary-sm gap-2" onClick={() => navigate(`/candidate/applications/${app._id}/interview/${nextInterviewIndex}`)}>
                                Next Stage: Join Interview {nextInterviewIndex + 1}
                              </Button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {journeyStages.map((stage) => (
                        <div key={stage.key} className={`rounded-xl border p-4 ${getStageTone(stage.status)}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <div className={stepStatusStyle[stage.status]}>
                                  {stage.status === "completed" ? <CheckCircle className="h-4 w-4" /> : stage.status === "scheduled" ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                </div>
                                <p className="font-medium text-sm">{stage.title}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">{stage.detail}</p>
                            </div>
                            <Badge variant="secondary" className="text-[11px] shrink-0 max-w-xs truncate">
                              {stage.label}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Retry Resume */}
                  {(app.screening?.status === "Not Shortlisted" || app.status === "Rejected") && (
                    <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 space-y-4">
                      {(!app.screening?.attempts || app.screening.attempts < 3) ? (
                        <div>
                          <h3 className="font-semibold text-sm mb-2">Try Again with Another Resume</h3>
                          <p className="text-xs text-muted-foreground mb-4">
                            You can upload a different resume and re-apply for this position. (Attempt {app.screening?.attempts || 1} of 3)
                          </p>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="application/pdf,.docx,.txt"
                              onChange={async (e) => {
                                const file = e.currentTarget.files?.[0];
                                if (!file) return;
  
                                try {
                                  setRetryingApplicationId(app._id);
                                  const payload = new FormData();
                                  payload.append("resume", file);
                                  
                                  const cacheKey = `resume_cache_${file.name}_${file.size}_${file.lastModified}`;
                                  const cached = localStorage.getItem(cacheKey);
                                  if (cached) {
                                    payload.append("cachedParsedResume", cached);
                                  }
  
                                  const { data } = await api.post(`/applications/${app.job._id}`, payload, {
                                    headers: { "Content-Type": "multipart/form-data" },
                                  });
  
                                  if (data.screening?.parsedResume) {
                                    localStorage.setItem(cacheKey, JSON.stringify(data.screening.parsedResume));
                                  }
  
                                  if (data.screening?.status === "Shortlisted") {
                                    toast.success("Great! You've been shortlisted with the new resume! 🎉");
                                  } else {
                                    toast.info("The new resume didn't pass screening. You can try again.");
                                  }
  
                                  const { data: updatedApps } = await api.get("/applications/my");
                                  setApplications(updatedApps);
                                } catch (error) {
                                  let errorMessage = "Failed to upload resume. Please try again.";
                                  if (error instanceof Error) {
                                    errorMessage = error.message;
                                  } else if (error && typeof error === "object" && "response" in error) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const resp = (error as any).response;
                                    errorMessage = resp?.data?.message || errorMessage;
                                  }
                                  toast.error(errorMessage);
                                  const { data: updatedApps } = await api.get("/applications/my");
                                  setApplications(updatedApps);
                                } finally {
                                  setRetryingApplicationId(null);
                                }
                              }}
                              disabled={retryingApplicationId === app._id}
                              className="cursor-pointer w-full"
                            />
                            {retryingApplicationId === app._id && (
                              <p className="text-xs text-muted-foreground">Uploading...</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-sm mb-1 text-destructive">Maximum Attempts Reached</h3>
                          <p className="text-xs text-muted-foreground">
                            You have exhausted all 3 attempts to clear the resume screening for this job.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}