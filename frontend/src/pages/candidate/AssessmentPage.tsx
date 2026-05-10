import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, Clock, FileText, CheckCircle2, AlertCircle, Maximize, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/api";
import { toast } from "sonner";
import AssessmentQuiz, { type Question } from "@/components/assessment/AssessmentQuiz";

type Stage = "loading" | "intro" | "generating" | "quiz" | "submitting" | "result";

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { applicationId, assessmentIndex } = useParams();

  const [stage, setStage] = useState<Stage>("loading");
  const [assessment, setAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<{ score: number; threshold: number; passed: boolean } | null>(null);

  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const violationCountRef = useRef(0);
  const pendingAnswersRef = useRef<Record<string, string>>({});
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

  const handleViolation = useCallback(() => {
    if (stageRef.current !== "quiz") return;
    violationCountRef.current += 1;
    setViolations(violationCountRef.current);
    
    toast.warning("⚠️ Proctoring violation! Please maintain fullscreen and stay on this tab.");
  }, []);

  useEffect(() => {
    if (stage !== "quiz") return;

    const onFullscreenChange = () => { 
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) handleViolation(); 
    };
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

  const handleStartAssessment = () => {
    requestFullscreen();
    setIsFullscreen(true);
    generateQuestions();
  };

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
    } catch {
      toast.error("Failed to generate questions. Please try again.");
      setStage("intro");
      exitFullscreen();
    }
  }, [applicationId, assessmentIndex]);

  const onQuizSubmit = useCallback(async (answers: Record<string, string>, isAutoSubmit?: boolean) => {
    pendingAnswersRef.current = answers;
    if (isAutoSubmit === true) {
      await handleSubmit(answers, false);
    } else {
      setShowConfirmSubmit(true);
    }
  }, [handleSubmit]);

  const onAnswersChange = useCallback((answers: Record<string, string>) => {
    pendingAnswersRef.current = answers;
  }, []);

  const confirmSubmit = useCallback(async () => {
    setShowConfirmSubmit(false);
    await handleSubmit(pendingAnswersRef.current, false);
  }, [handleSubmit]);

  const cancelSubmit = useCallback(() => {
    setShowConfirmSubmit(false);
  }, []);

  if (stage === "quiz") {
    const answeredCount = Object.keys(pendingAnswersRef.current).filter(k => pendingAnswersRef.current[k]).length;
    const unansweredCount = questions.length - answeredCount;
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
        {showConfirmSubmit && (
          <div className="absolute inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <FileText className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-3xl font-display font-bold mb-2">Submit Assessment?</h2>
            <p className="text-muted-foreground mb-8 max-w-md text-lg">
              {unansweredCount > 0 
                ? `You still have ${unansweredCount} unanswered question(s). It is not compulsory to attempt all questions, but unattempted questions will yield 0 marks.` 
                : "You have answered all questions! Are you sure you want to submit?"}
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" variant="outline" onClick={cancelSubmit} className="h-12 px-8 text-lg">
                Return to Quiz
              </Button>
              <Button size="lg" onClick={confirmSubmit} className="glow-primary h-12 px-8 text-lg">
                Yes, Submit
              </Button>
            </div>
          </div>
        )}
        {!isFullscreen && (
          <div className="absolute inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4 animate-bounce" />
            <h2 className="text-3xl font-display font-bold mb-2">Fullscreen Required</h2>
            <p className="text-muted-foreground mb-8 max-w-md text-lg">
              You have exited fullscreen mode or switched tabs. Please return to fullscreen to continue your assessment.
            </p>
            <Button size="lg" onClick={() => { requestFullscreen(); setIsFullscreen(true); }} className="glow-primary h-12 px-8 text-lg">
              Return to Fullscreen
            </Button>
          </div>
        )}
        {violations > 0 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-orange-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            Violations: {violations}
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
          <p className="text-muted-foreground animate-pulse">Generating your assessment questions...</p>
        </div>
      )}

      {stage === "intro" && (
        <div className="max-w-2xl mx-auto glass p-8 rounded-2xl animate-fade-in mt-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">HireFlow Assessment</h1>
              <p className="text-muted-foreground">{assessment?.title || "Technical Assessment"}</p>
            </div>
          </div>
          
          <div className="space-y-6 mb-8">
            <div className="bg-muted/30 p-4 rounded-xl space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" /> Instructions
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li><strong>Time Limit:</strong> {assessment?.suggestedDurationMinutes || 30} minutes.</li>
                <li><strong>Marking Scheme:</strong> +1 mark for each correct answer. No negative marking.</li>
                <li><strong>Proctoring:</strong> This assessment requires Full-Screen mode.</li>
                <li><strong>Violations:</strong> Do not switch tabs, minimize the browser, or exit full-screen. Exiting fullscreen will pause the assessment until you return to fullscreen mode.</li>
                <li>Ensure you have a stable internet connection before starting.</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded-xl flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-semibold">{assessment?.suggestedDurationMinutes || 30} mins</p>
                </div>
              </div>
              <div className="glass p-4 rounded-xl flex items-center gap-3">
                <Maximize className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Proctoring</p>
                  <p className="font-semibold">Strict (Fullscreen)</p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleStartAssessment} className="w-full h-12 text-base glow-primary">
            I Understand, Start Assessment
          </Button>
        </div>
      )}
      
      {stage === "submitting" && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground animate-pulse">Submitting your assessment...</p>
        </div>
      )}

      {stage === "result" && result && (
        <div className="max-w-2xl mx-auto glass p-10 rounded-2xl text-center animate-fade-in mt-8">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 ${result.passed ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
            {result.passed ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            ) : (
              <AlertCircle className="h-10 w-10 text-amber-500" />
            )}
          </div>
          <h2 className="text-3xl font-display font-bold mb-2">
            {result.passed ? "Assessment Passed!" : "Assessment Completed"}
          </h2>
          <p className="text-muted-foreground mb-8">
            You scored <span className="font-bold text-foreground">{result.score}%</span> (Threshold: {result.threshold}%)
          </p>
          <Button onClick={() => navigate("/candidate/applications")} className="glow-primary-sm">
            Back to Applications
          </Button>
        </div>
      )}
    </div>
  );
}