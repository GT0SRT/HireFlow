import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import api from "@/api/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

type AssessmentStep = {
  test_type: string;
  focus_topics: string[];
  suggested_duration_minutes: number;
};

type InterviewStep = {
  interview_round: string;
  focus_topics: string[];
};

type JobDescription = {
  assessment_plan?: AssessmentStep[];
  interview_plan?: InterviewStep[];
};

interface ApplicationFormModalProps {
  open: boolean;
  onClose: () => void;
  job: {
    _id: string;
    title: string;
    job_description?: JobDescription;
    [key: string]: unknown;
  } | null;
}

type ScreeningResult = {
  threshold: number;
  score: number | null;
  status: "Shortlisted" | "Not Shortlisted";
  reason: string | null;
  resumeAnalysis: Record<string, unknown> | null;
  missingMandatorySkills?: string[];
  interviewTopics?: string[];
};

type ApplicationStatus = "form" | "screening" | "already-applied" | "error" | "rejected";

export default function ApplicationFormModal({
  open,
  onClose,
  job,
}: ApplicationFormModalProps) {
  const assessmentPlan = job?.job_description?.assessment_plan || [];
  const interviewPlan = job?.job_description?.interview_plan || [];
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    github: "",
    linkedin: "",
    resume: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [screening, setScreening] = useState<ScreeningResult | null>(null);
  const [status, setStatus] = useState<ApplicationStatus>("form");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setScreening(null);
      setStatus("form");
      setErrorMessage("");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        github: "",
        linkedin: "",
        resume: null,
      });
    }
  }, [open]);

  if (!job) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // For file upload
    if ((e.target as HTMLInputElement).files) {
      const { files } = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: files ? files[0] : null,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (!job?._id) return;

    if (!formData.resume) {
      toast.error("Please upload your resume first.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("resume", formData.resume);

      const { data } = await api.post(`/applications/${job._id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Check if resume was parsed successfully
      if (!data.screening || !data.screening.resumeAnalysis) {
        setStatus("error");
        setErrorMessage(data.message || "Failed to parse resume. Please try again with a different file.");
        toast.error("Resume parsing failed");
        return;
      }

      setScreening(data.screening);

      // Handle different screening statuses
      if (data.screening.status === "Shortlisted") {
        setStatus("screening");
        toast.success("Congratulations! You've been shortlisted! 🎉");
      } else {
        // Not shortlisted - allow another attempt
        setStatus("rejected");
        toast.info("You can try uploading another resume");
      }
    } catch (error: unknown) {
      const errorData = error as { response?: { data?: { message?: string; isAlreadyApplied?: boolean; screening?: ScreeningResult } } };
      const message = errorData?.response?.data?.message || "Failed to submit application";
      const isAlreadyApplied = errorData?.response?.data?.isAlreadyApplied;
      const existingScreening = errorData?.response?.data?.screening;

      if (isAlreadyApplied) {
        // User already applied - show their existing application status
        setStatus("already-applied");
        if (existingScreening) {
          setScreening(existingScreening);
        }
        toast.info("You have already applied for this position");
      } else {
        setStatus("error");
        setErrorMessage(message);
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setStatus("form");
    setFormData({ ...formData, resume: null });
    setScreening(null);
  };

  const handleClose = () => {
    setScreening(null);
    onClose();
  };

  const renderStepCards = (
    title: string,
    emptyText: string,
    steps: AssessmentStep[] | InterviewStep[],
    kind: "assessment" | "interview"
  ) => (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">Step by step after shortlist</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          Next stage
        </Badge>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={`${kind}-${index}`} className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary shrink-0">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {kind === "assessment"
                        ? (step as AssessmentStep).test_type
                        : (step as InterviewStep).interview_round}
                    </p>
                    {kind === "assessment" && (step as AssessmentStep).suggested_duration_minutes ? (
                      <Badge variant="outline" className="text-xs">
                        {(step as AssessmentStep).suggested_duration_minutes} min
                      </Badge>
                    ) : null}
                  </div>
                  {(kind === "assessment"
                    ? (step as AssessmentStep).focus_topics
                    : (step as InterviewStep).focus_topics
                  )?.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Topics: {(kind === "assessment"
                        ? (step as AssessmentStep).focus_topics
                        : (step as InterviewStep).focus_topics
                      ).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : handleClose())}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 rounded-xl"
      >
        {/* Sticky Header */}
        <DialogHeader
          className="sticky top-0 bg-background z-20 px-8 py-4 border-b border-white/10 shadow-sm"
        >
          <DialogTitle className="text-2xl font-semibold">
            {status === "already-applied"
              ? `Already Applied for ${job.title}`
              : `Apply for ${job.title}`}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="px-8 py-6 space-y-10">
          {/* ALREADY APPLIED STATE */}
          {status === "already-applied" && (
            <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 space-y-4">
              <div className="rounded-xl bg-blue-500/10 p-4 space-y-2 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  <p className="font-semibold text-blue-500">You have already applied for this job</p>
                </div>
              </div>

              {screening && (
                <div className="rounded-xl bg-muted/30 p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {screening.status === "Shortlisted" ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-destructive" />
                    )}
                    {screening.score != null && (
                      <span className="text-sm font-medium">ATS Score: {screening.score}%</span>
                    )}
                    <Badge
                      variant="outline"
                      className={
                        screening.status === "Shortlisted"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }
                    >
                      {screening.status}
                    </Badge>
                  </div>
                  {screening.reason && (
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {screening.reason}
                    </p>
                  )}
                </div>
              )}

              {screening?.status === "Shortlisted" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 md:p-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <p className="font-semibold text-emerald-600">You are shortlisted</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Keep an eye on your email. We will contact you with further details.
                    </p>
                  </div>

                  {renderStepCards(
                    "Assessment Stage",
                    "Assessment details will be shared by email if no plan is configured yet.",
                    assessmentPlan,
                    "assessment"
                  )}

                  {renderStepCards(
                    "Interview Stage",
                    "Interview details will be shared by email after assessment completion.",
                    interviewPlan,
                    "interview"
                  )}
                </div>
              )}

              <Button className="w-full" onClick={handleClose}>
                Close
              </Button>
            </div>
          )}

          {/* ERROR STATE - Parse Failed */}
          {status === "error" && (
            <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 space-y-4">
              <div className="rounded-xl bg-destructive/10 p-4 space-y-2 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <XCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">Something went wrong</p>
                    <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" onClick={handleRetry} variant="outline">
                  Try Again
                </Button>
                <Button className="w-full" onClick={handleClose} variant="ghost">
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* REJECTED STATE - Not Shortlisted (Allow Retry) */}
          {status === "rejected" && screening && (
            <div className="space-y-4">
              {/* Result Section */}
              <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 space-y-4">
                <div className="rounded-xl bg-muted/30 p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <XCircle className="h-6 w-6 text-destructive" />
                    {screening.score != null && <span className="text-sm font-medium">ATS Score: {screening.score}%</span>}
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      {screening.status}
                    </Badge>
                  </div>
                  {screening.reason && (
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {screening.reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Try Again Section */}
              <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Upload Another Resume</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    You can upload a different resume and try again.
                  </p>
                  <Label>Resume (PDF, DOCX, TXT)</Label>
                  <Input
                    type="file"
                    name="resume"
                    accept="application/pdf,.docx,.txt"
                    onChange={handleChange}
                    className="cursor-pointer mt-2"
                  />
                </div>

                <div className="space-y-3">
                  <Button className="w-full h-12 text-base" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "uploading..." : "Try Again"}
                  </Button>
                  <Button className="w-full" onClick={handleClose} variant="ghost">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* SHORTLISTED STATE */}
          {status === "screening" && screening && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 space-y-4">
                <div className="rounded-xl bg-emerald-500/10 p-4 space-y-2 border border-emerald-500/20">
                  <div className="flex flex-wrap items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    {screening.score != null && <span className="text-sm font-medium">ATS Score: {screening.score}%</span>}
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      {screening.status}
                    </Badge>
                  </div>
                  {screening.reason && (
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {screening.reason}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <p className="font-semibold text-primary">You are shortlisted</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Keep an eye on your email. We will contact you with further details.
                  </p>
                </div>
              </div>

              {renderStepCards(
                "Assessment Stage",
                "Assessment details will be shared by email if no plan is configured yet.",
                assessmentPlan,
                "assessment"
              )}

              {renderStepCards(
                "Interview Stage",
                "Interview details will be shared by email after assessment completion.",
                interviewPlan,
                "interview"
              )}

              <Button className="w-full" onClick={handleClose}>
                Close
              </Button>
            </div>
          )}

          {/* FORM STATE - Initial Upload */}
          {status === "form" && (
            <>
              {/* SECTION : Resume */}
              <div>
                <h2 className="text-lg font-medium mb-4">Resume</h2>

                <div className="space-y-2">
                  <Label>Upload Resume (PDF, DOCX, TXT)</Label>
                  <Input
                    type="file"
                    name="resume"
                    accept="application/pdf,.docx,.txt"
                    onChange={handleChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload your resume for AI parsing and ATS screening.
                  </p>
                </div>
              </div>

              <Button className="w-full h-12 text-base" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "uploading..." : "Upload"}
              </Button>
            </>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}