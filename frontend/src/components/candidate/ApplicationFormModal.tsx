import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, X, XCircle } from "lucide-react";

type AssessmentStep = {
  test_type: string;
  focus_topics: string[];
  suggested_duration_minutes: number;
};

type JobDescription = {
  assessment_plan?: AssessmentStep[];
};

type ParsedResume = Record<string, unknown>;

type ApplicationScreening = {
  threshold?: number;
  atsThreshold?: number;
  atsScore?: number | null;
  score?: number | null;
  status?: string;
  reason?: string;
  reasoningForCandidate?: string;
  missingMandatorySkills?: string[];
  attempts?: number;
};

type ExistingApplication = {
  _id?: string;
  job?: { _id?: string } | string;
  status?: string;
  screening?: ApplicationScreening;
  parsedResume?: ParsedResume;
  assessments?: any[];
  currentAssessmentIndex?: number;
};

type ApplicationApiError = {
  message?: string;
  isAlreadyApplied?: boolean;
  screening?: ApplicationScreening & {
    parsedResume?: ParsedResume;
  };
  application?: { _id?: string };
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
  status?: string;
  reason: string;
  parsedResume: ParsedResume;
  missingMandatorySkills: string[];
  attempts?: number;
};

type ApplicationStatus = "form" | "screening" | "already-applied" | "rejected";

export default function ApplicationFormModal({
  open,
  onClose,
  job,
}: ApplicationFormModalProps) {
  const navigate = useNavigate();
  const assessmentPlan = job?.job_description?.assessment_plan || [];
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    github: "",
    linkedin: "",
    resume: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [screening, setScreening] = useState<ScreeningResult | null>(null);
  const [status, setStatus] = useState<ApplicationStatus>("form");
  const [showAssessmentStage, setShowAssessmentStage] = useState(false);
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [pendingAssessmentIndex, setPendingAssessmentIndex] = useState(0);
  const [checking, setChecking] = useState(false);
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [createdApplicationId, setCreatedApplicationId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !job?._id) {
      setStatus("form");
      setScreening(null);
      setFormData((prev) => ({ ...prev, resume: null }));
      setShowAssessmentStage(false);
      setAssessmentIndex(0);
      setPendingAssessmentIndex(0);
      setCreatedApplicationId(null);
      return;
    }

    let mounted = true;
    const checkExisting = async () => {
      setChecking(true);
      try {
        const { data } = await api.get<ExistingApplication[]>("/applications/my");
        if (!mounted) return;

        const existingApp = data.find((app) => {
          if (typeof app.job === "string") {
            return app.job === job._id;
          }

          return app.job?._id === job._id;
        });

        if (existingApp) {
          setHasExistingApplication(true);
          setCreatedApplicationId(existingApp._id || (existingApp as any).applicationId || null);
          
          const completedAssessmentsCount = Array.isArray(existingApp.assessments) ? existingApp.assessments.length : 
                        Array.isArray((existingApp as any).assessmentScores) ? (existingApp as any).assessmentScores.length : 0;
          const nextIdx = existingApp.currentAssessmentIndex ?? completedAssessmentsCount;
          setPendingAssessmentIndex(nextIdx);
          setAssessmentIndex(nextIdx);
          
          const s = existingApp.screening || {};
          const applicationStatus = existingApp.status ?? "";

          if (s.status) {
            setScreening({
              threshold: s.atsThreshold || 70,
              score: s.atsScore ?? s.score ?? null,
              status: s.status,
              reason: s.reasoningForCandidate || s.reason || "",
              parsedResume: existingApp.parsedResume || {},
              missingMandatorySkills: s.missingMandatorySkills || [],
              attempts: s.attempts || 1,
            });
            
            if (s.status === "Shortlisted" || ["Assessment Pending", "Interview Scheduled", "Selected", "Offered"].includes(applicationStatus)) {
              setStatus("already-applied");
            } else {
              setStatus("rejected");
            }
          } else {
            setStatus("already-applied");
          }
        } else {
          setHasExistingApplication(false);
          setStatus("form");
        }
      } catch {
        if (mounted) {
          setHasExistingApplication(false);
          setStatus("form");
        }
      } finally {
        if (mounted) setChecking(false);
      }
    };

    checkExisting();
    return () => { mounted = false; };
  }, [open, job?._id]);

  if (!job) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

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
      
      const cacheKey = `resume_cache_${formData.resume.name}_${formData.resume.size}_${formData.resume.lastModified}`;
      const cachedParsed = localStorage.getItem(cacheKey);
      
      if (cachedParsed) {
        payload.append("cachedParsedResume", cachedParsed);
      }

      const { data } = await api.post(`/applications/${job._id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!data.screening) {
        setStatus("rejected");
        setScreening(null);
        toast.error("Something went wrong. Try again");
        return;
      }

      setHasExistingApplication(true);
      const s = data.screening;
      
      setScreening({
        threshold: s.threshold || s.atsThreshold || 70,
        score: s.score ?? s.atsScore ?? null,
        status: s.status,
        reason: s.reason || s.reasoningForCandidate || "",
        parsedResume: s.parsedResume || {},
        missingMandatorySkills: s.missingMandatorySkills || [],
        attempts: s.attempts || 1,
      });

      if (s.parsedResume) {
        localStorage.setItem(cacheKey, JSON.stringify(s.parsedResume));
      }

      if (s.status === "Shortlisted") {
        setCreatedApplicationId(data.application?._id || data._id || data.applicationId);
        setStatus("screening");
        setAssessmentIndex(0);
        setPendingAssessmentIndex(0);
        toast.success("Congratulations! You've been shortlisted! 🎉");
      } else {
        setStatus("rejected");
      }
    } catch (error: unknown) {
      const errorData = isAxiosError<ApplicationApiError>(error) ? error.response?.data : undefined;

      const s = errorData?.screening || {};
      if (s.status) {
        setHasExistingApplication(true);
        setCreatedApplicationId(errorData?.application?._id || (errorData as any)?._id || null);
        setScreening({
          threshold: s.atsThreshold ?? s.threshold ?? 70,
          score: s.atsScore ?? s.score ?? null,
          status: s.status,
          reason: s.reasoningForCandidate || s.reason || "",
          parsedResume: s.parsedResume || {},
          missingMandatorySkills: s.missingMandatorySkills || [],
          attempts: s.attempts || 1,
        });
        if (s.status === "Shortlisted") {
          setStatus("already-applied");
        } else {
          setStatus("rejected");
        }
      } else {
        setStatus("rejected");
        setScreening(null);
      }

      if (errorData?.isAlreadyApplied) {
        toast.info("You have already applied for this position");
      } else {
        toast.error(errorData?.message || "Something went wrong. Try again");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setScreening(null);
    onClose();
  };

  const handleViewNextAssessment = () => {
    setShowAssessmentStage(true);
    setAssessmentIndex(pendingAssessmentIndex);
  };

  const handleNextAssessment = () => {
    setAssessmentIndex((currentIndex) => Math.min(currentIndex + 1, Math.max(assessmentPlan.length - 1, 0)));
  };

  const renderAssessmentCard = (step: AssessmentStep, index: number) => (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Assessment Stage</h3>
          <p className="text-sm text-muted-foreground">Immediate next assessment only</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          Step {index + 1} of {assessmentPlan.length || 1}
        </Badge>
      </div>

      <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold">{step.test_type}</p>
          {step.suggested_duration_minutes ? (
            <Badge variant="outline" className="text-xs">
              {step.suggested_duration_minutes} min
            </Badge>
          ) : null}
        </div>

        {step.focus_topics && (
          <p className="text-sm text-muted-foreground">Topics: {Array.isArray(step.focus_topics) ? step.focus_topics.join(", ") : step.focus_topics}</p>
        )}

        <p className="text-xs text-muted-foreground">
          Questions for this stage will be generated in the frontend flow and saved with the application later.
        </p>
      </div>

      {index < assessmentPlan.length - 1 ? (
        <Button className="w-full" variant="outline" onClick={handleNextAssessment}>
          Next Assessment
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">This is the last assessment stage available right now.</p>
      )}
    </div>
  );

  // LOGIC: Check if score is null or completely missing so we can show re-upload option
  const isAtsScoreMissing = !screening || screening.score === null || screening.score === undefined;

  const attempts = screening?.attempts || 1;
  const canRetry = attempts < 3;

  // REUSABLE UPLOAD CARD: Used for both Rejections AND missing ATS scores.
  const uploadAnotherResumeCard = (
    <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 space-y-4">
      {canRetry ? (
        <>
          <div>
            <h3 className="font-semibold text-sm mb-1">
              {status === "already-applied" ? "ATS Score Missing? Re-upload Resume" : "Upload Another Resume"}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {status === "already-applied"
                ? "Your ATS score couldn't be evaluated previously. You can upload your resume again to overwrite the old one and re-run the screening."
                : `You can upload a different resume and try again. (Attempt ${attempts} of 3)`}
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
          <Button className="w-full h-10" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Uploading & Screening..." : "Try Again"}
          </Button>
        </>
      ) : (
        <div>
          <h3 className="font-semibold text-sm mb-1 text-destructive">Maximum Attempts Reached</h3>
          <p className="text-xs text-muted-foreground">
            You have exhausted all 3 attempts to apply for this job. You cannot upload another resume.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? undefined : handleClose())}>
      <DialogContent className="w-[calc(100dvw-1.5rem)] max-w-2xl mx-auto my-4 max-h-[calc(100vh-2rem)] p-0 rounded-2xl sm:max-h-[85vh] [&>button]:hidden flex flex-col">
        <DialogHeader className="sticky top-0 z-20 border-b border-white/10 bg-background px-4 py-4 pr-14 shadow-sm sm:px-8">
          <DialogTitle className="text-2xl font-semibold">
            {status === "already-applied" || hasExistingApplication ? `Application for ${job.title}` : `Apply for ${job.title}`}
          </DialogTitle>

          <DialogClose className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/90 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:right-4 sm:top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-6 px-4 py-5 sm:px-8 sm:py-6 overflow-y-auto">
          {checking ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-sm text-muted-foreground">Checking application status...</p>
            </div>
          ) : (
            <>
              {/* 1. ALREADY APPLIED (NO SCREENING DATA FOUND) */}
              {status === "already-applied" && !screening && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 space-y-4">
                    <div className="rounded-xl bg-blue-500/10 p-4 space-y-2 border border-blue-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-blue-500" />
                        <p className="font-semibold text-blue-500">You have already applied for this job</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Show re-upload card here since ATS is totally missing */}
                  {uploadAnotherResumeCard}
                  
                  <Button className="w-full" variant="outline" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              )}

              {/* 2. ALREADY APPLIED OR SCREENING SUCCESS (SCREENING DATA EXISTS) */}
              {(status === "already-applied" || status === "screening") && screening && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 space-y-4">
                    <div className="rounded-xl bg-emerald-500/10 p-4 space-y-2 border border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        {screening.score !== null && (
                          <span className="text-sm font-medium text-emerald-500">ATS Score: {screening.score}%</span>
                        )}
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          Shortlisted
                        </Badge>
                      </div>
                      {screening.reason && (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{screening.reason}</p>
                      )}
                    </div>
                  </div>

                  {showAssessmentStage ? (
                    assessmentPlan.length > 0 ? (
                      assessmentPlan[assessmentIndex] ? (
                        renderAssessmentCard(assessmentPlan[assessmentIndex], assessmentIndex)
                      ) : (
                        <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 text-sm text-muted-foreground">
                          You have completed all available assessment stages for this role.
                        </div>
                      )
                    ) : (
                      <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 text-sm text-muted-foreground">
                        No assessment stages are configured for this role yet.
                      </div>
                    )
                  ) : (
                    <Button className="w-full" variant="outline" onClick={handleViewNextAssessment}>
                      View Next Assessment
                    </Button>
                  )}

                  {/* Show re-upload card if ATS score failed to load (either for new application or already applied) */}
                  {isAtsScoreMissing && (status === "already-applied" || status === "screening") && uploadAnotherResumeCard}

                  <div className="flex flex-col gap-2">
                    {assessmentPlan.length > pendingAssessmentIndex && createdApplicationId && (
                      <Button
                        className="w-full"
                        onClick={() => {
                          onClose();
                          navigate(`/candidate/applications/${createdApplicationId}/assessment/${pendingAssessmentIndex}`);
                        }}
                      >
                        Start Assessment {pendingAssessmentIndex + 1}
                      </Button>
                    )}
                    <Button
                      className="w-full"
                      variant={(isAtsScoreMissing && status === "already-applied") ? "outline" : "default"}
                      onClick={() => {
                        onClose();
                        navigate("/candidate/applications");
                      }}
                    >
                      {assessmentPlan.length > 0 && createdApplicationId ? "View My Applications" : "Close"}
                    </Button>
                  </div>
                </div>
              )}

              {/* 3. REJECTED */}
              {status === "rejected" && (
                <div className="space-y-4">
                  {screening && (
                    <div className="rounded-2xl border border-border/60 bg-background/60 p-5 md:p-6 space-y-4">
                      <div className="rounded-xl bg-destructive/10 p-4 space-y-2 border border-destructive/20">
                        <div className="flex flex-wrap items-center gap-2">
                          <XCircle className="h-6 w-6 text-destructive" />
                          {screening.score !== null && (
                            <span className="text-sm font-medium text-destructive">ATS Score: {screening.score}%</span>
                          )}
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                            Not Shortlisted
                          </Badge>
                        </div>
                        {screening.reason && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                            {screening.reason}
                          </p>
                        )}
                        {screening.missingMandatorySkills && screening.missingMandatorySkills.length > 0 && (
                          <div className="pt-2">
                            <p className="text-sm font-medium text-destructive">Missing Mandatory Skills:</p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                              {screening.missingMandatorySkills.map((skill) => (
                                <li key={skill}>{skill}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Always show re-upload card for rejected status */}
                  {uploadAnotherResumeCard}
                </div>
              )}

              {/* 4. FRESH FORM */}
              {status === "form" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium mb-3">Submit Application</h2>
                    <div className="space-y-2">
                      <Label>Upload Resume (PDF, DOCX, TXT)</Label>
                      <Input
                        type="file"
                        name="resume"
                        accept="application/pdf,.docx,.txt"
                        onChange={handleChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">Upload your resume for AI parsing and ATS screening.</p>
                    </div>
                  </div>

                  <Button className="w-full h-12 text-base" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Uploading & Screening..." : "Upload & Apply"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}