import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, Clock, FileText, CheckCircle2, AlertCircle, Maximize, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/api";
import { toast } from "sonner";
import AssessmentQuiz, { type Question } from "@/components/assessment/AssessmentQuiz";

type Stage = "loading" | "intro" | "generating" | "quiz" | "submitting" | "result";

const MAX_VIOLATIONS = 3;

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { applicationId, assessmentIndex } = useParams();

  const [stage, setStage] = useState<Stage>("loading");
  const [assessment, setAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<{ score: number; threshold: number; passed: boolean } | null>(null);

  const [violations, setViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const violationCountRef = useRef(0);
  const pendingAnswersRef = useRef<Record<string, string>>({});
  const autoSubmitRef = useRef<(() => void) | null>(null);
  const stageRef = useRef<Stage>("loading");

  useEffect(() => { stageRef.current = stage; }, [stage]);

  useEffect(() => {
    api.get("/applications/my")
      .then(({ data }) => {
        const foundApp = data.find((a: any) => a._id === applicationId);
        if (foundApp) {
          const currentAss = foundApp.assessment?.[Number(assessmentIndex)];
          setAssessment(currentAss);
          if (currentAss?.score != null) {
            setResult({
              score: currentAss.score,
              threshold: currentAss.threshold || 60,
              passed: currentAss.score >= (currentAss.threshold || 60),
            });
            setStage("result");
          } else {
            setStage("intro");
          }
        } else {
          toast.error("Application not found.");
          navigate(-1);
        }
      })
      .catch(() => toast.error("Failed to load assessment data"));
  }, [applicationId, assessmentIndex, navigate]);

  const requestFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  };

  const handleSubmit = useCallback(async (answers: Record<string, string>, autoSubmitted = false) => {
    setStage("submitting");
    exitFullscreen();
    try {
      const { data } = await api.post(
        `/applications/${applicationId}/assessment/${assessmentIndex}/submit`,
        { answers }
      );
      if (autoSubmitted) toast.warning("Assessment auto-submitted due to fullscreen violations.");
      else toast.success("Assessment submitted successfully!");
      setResult({ score: data.score, threshold: data.threshold || 60, passed: data.passed });
      setStage("result");
    } catch {
      toast.error("Failed to submit assessment.");
      setStage("intro");
    }
  }, [applicationId, assessmentIndex]);

  useEffect(() => {
    autoSubmitRef.current = () => handleSubmit(pendingAnswersRef.current, true);
  }, [handleSubmit]);

  const handleViolation = useCallback(() => {
    if (stageRef.current !== "quiz") return;
    violationCountRef.current += 1;
    const count = violationCountRef.current;
    setViolations(count);
    setShowViolationWarning(true);

    if (count >= MAX_VIOLATIONS) {
      toast.error("Maximum violations reached. Auto-submitting assessment...");
      autoSubmitRef.current?.();
      return;
    }

    const remaining = MAX_VIOLATIONS - count;
    toast.warning(`⚠️ Violation ${count}/${MAX_VIOLATIONS}! ${remaining} warning(s) left before auto-submit.`);
    setTimeout(() => {
      setShowViolationWarning(false);
      if (!document.fullscreenElement && stageRef.current === "quiz") requestFullscreen();
    }, 3000);
  }, []);

  useEffect(() => {
    if (stage !== "quiz") return;

    const onFullscreenChange = () => { if (!document.fullscreenElement) handleViolation(); };
    const onVisibilityChange = () => { if (document.hidden) handleViolation(); };
    const onBlur = () => handleViolation();

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [stage, handleViolation]);

  const generateQuestions = useCallback(async () => {
    setStage("generating");
    try {
      const { data } = await api.post(
        `/applications/${applicationId}/assessment/${assessmentIndex}/generate`
      );
      if (!data.questions || data.questions.length === 0) throw new Error("No questions");
      setQuestions(data.questions);
      setAssessment((prev: any) => ({ ...prev, ...data.assessment }));
      setStage("quiz");
      requestFullscreen();
    } catch {
      toast.error("Failed to generate questions. Please try again.");
      setStage("intro");
    }
  }, [applicationId, assessmentIndex]);

  const onQuizSubmit = useCallback(async (answers: Record<string, string>) => {
    pendingAnswersRef.current = answers;
    await handleSubmit(answers, false);
  }, [handleSubmit]);

  const onAnswersChange = useCallback((answers: Record<string, string>) => {
    pendingAnswersRef.current = answers;
  }, []);

  if (stage === "quiz") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
        {showViolationWarning && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground text-center py-3 px-4 flex items-center justify-center gap-2">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span className="font-semibold">
              ⚠️ Fullscreen violation {violations}/{MAX_VIOLATIONS}!{" "}
              {violations >= MAX_VIOLATIONS ? "Auto-submitting..." : "Return to fullscreen immediately!"}
            </span>
          </div>
        )}
        {violations > 0 && !showViolationWarning && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-orange-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            Violations: {violations}/{MAX_VIOLATIONS}
          </div>
        )}
        <div className="flex-1 overflow-auto">
          <AssessmentQuiz
            questions={questions}
            totalTime={(assessment?.suggestedDurationMinutes || 30) * 60}
            loading={false}
            onSubmit={onQuizSubmit}
            onAnswersChange={onAnswersChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-12 md:pt-1 pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
        Back
      </button>

      {stage === "loading" && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {stage === "generating" && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground font-medium">Generating questions with AI...</p>
          <p className="text-sm text-muted-foreground">This may take a few seconds.</p>
        </div>
      )}

      {stage === "intro" && assessment && (
        <div className="glass rounded-2xl p-8 md:p-10 space-y-6 max-w-4xl mx-auto animate-fade-in text-center sm:text-left">
          <h1 className="text-3xl font-display font-bold">
            Assessment {Number(assessmentIndex || 0) + 1}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex items-start gap-4">
              <FileText className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-lg">{assessment.testType || "Technical Assessment"}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Topics: {Array.isArray(assessment.coveredTopics)
                    ? assessment.coveredTopics.join(", ")
                    : assessment.coveredTopics || "General skills"}
                </p>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex items-start gap-4">
              <Clock className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-lg">{assessment.suggestedDurationMinutes || 30} Minutes</p>
                <p className="text-muted-foreground text-sm mt-1">Timed automatically. Submission enforced when time runs out.</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 text-left">
            <ShieldAlert className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-orange-500 mb-1">Proctored Assessment</p>
              <p className="text-muted-foreground">
                This assessment runs in <strong>fullscreen mode</strong>. Exiting fullscreen, switching tabs, or leaving the window counts as a violation. After <strong>3 violations</strong>, your assessment will be auto-submitted.
              </p>
            </div>
          </div>

          <div className="text-left space-y-2 text-sm text-muted-foreground bg-muted/30 p-6 rounded-xl">
            <p className="font-medium text-foreground mb-1">Instructions:</p>
            <p>• Do not refresh or close the browser window once started.</p>
            <p>• Ensure you have a stable internet connection.</p>
            <p>• All answers will be finalized securely on the server upon submission.</p>
            <p>• Navigate between questions freely using the question map or buttons.</p>
          </div>

          <Button size="lg" onClick={generateQuestions} className="w-full text-base font-semibold flex items-center justify-center gap-2">
            <Maximize className="h-5 w-5" />
            Start Assessment Now (Fullscreen)
          </Button>
        </div>
      )}

      {stage === "submitting" && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground">Submitting your answers securely...</p>
        </div>
      )}

      {stage === "result" && result && (
        <div className="glass rounded-2xl p-8 md:p-12 text-center space-y-6 max-w-xl mx-auto animate-fade-in-up">
          <div className="flex justify-center mb-2">
            {result.passed
              ? <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              : <AlertCircle className="h-16 w-16 text-destructive" />}
          </div>
          <h2 className="text-2xl font-bold">Assessment Completed</h2>
          <p className="text-5xl font-display font-bold text-primary">{result.score}%</p>
          <p className="text-muted-foreground">
            {result.passed
              ? "Congratulations! You have cleared this assessment stage."
              : "Unfortunately, you did not meet the required threshold for this stage."}
          </p>
          <p className="text-sm text-muted-foreground">Passing threshold: {result.threshold}%</p>
          <Button className="w-full" onClick={() => navigate("/candidate/applications")}>
            Back to My Applications
          </Button>
        </div>
      )}
    </div>
  );
}
