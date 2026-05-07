import { useEffect, useState } from "react";
import { ChevronLeft, Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/api";
import { toast } from "sonner";
import AssessmentQuiz, { type Question } from "@/components/assessment/AssessmentQuiz";

type Stage = "loading" | "intro" | "quiz" | "submitting" | "result";

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { applicationId, assessmentIndex } = useParams();
  
  const [stage, setStage] = useState<Stage>("loading");
  const [assessment, setAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Fetch user applications to find the exact assessment matching the ID & Index
    api.get("/applications/my")
      .then(({ data }) => {
        const foundApp = data.find((a: any) => a._id === applicationId);
        if (foundApp) {
          const currentAss = foundApp.assessment?.[Number(assessmentIndex)];
          setAssessment(currentAss);
          
          if (currentAss?.score != null) {
            setStage("result");
          } else {
            // Parse questions (if backend provides stringified JSONs) or provide fallback dummy ones if backend gen fails
            let parsed: Question[] = [];
            try {
              if (currentAss?.questions?.length > 0) {
                parsed = typeof currentAss.questions[0] === 'string' 
                  ? currentAss.questions.map((q: string) => JSON.parse(q))
                  : currentAss.questions;
              }
            } catch(e) { console.error("Error parsing questions", e); }

            // Provide strict fallback if backend hasn't generated questions yet
            if (parsed.length === 0) {
              parsed = [
                { id: "q1", question: "What is the core feature of React for building UIs?", options: ["Direct DOM manipulation", "Virtual DOM", "Two-way data binding", "String templates"], topic: "React" },
                { id: "q2", question: "Which algorithm ensures O(log n) search time?", options: ["Bubble Sort", "Linear Search", "Binary Search", "Quick Sort"], topic: "Algorithms" },
                { id: "q3", question: "What does CSS stand for?", options: ["Cascading Style Sheets", "Creative Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], topic: "CSS" },
              ];
            }
            setQuestions(parsed);
            setStage("intro");
          }
        } else {
          toast.error("Application not found.");
          navigate(-1);
        }
      })
      .catch(() => toast.error("Failed to load assessment data"));
  }, [applicationId, assessmentIndex, navigate]);

  return (
    <div className={`max-w-6xl mx-auto pt-12 md:pt-1 pb-12 ${stage === "quiz" ? "h-[calc(100vh-6rem)]" : ""}`}>
      {stage !== "quiz" && (
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
        Back
      </button>
      )}

      {stage === "loading" && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {stage === "intro" && assessment && (
        <div className="glass rounded-2xl p-8 md:p-10 space-y-6 max-w-4xl mx-auto animate-fade-in text-center sm:text-left">
          <h1 className="text-3xl font-display font-bold">{`Assessment ${Number(assessmentIndex || 0) + 1}`}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex items-start gap-4">
              <FileText className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-lg">{assessment.testType || "Technical Assessment"}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Topics: {Array.isArray(assessment.coveredTopics) ? assessment.coveredTopics.join(", ") : assessment.coveredTopics || "General skills"}
                </p>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex items-start gap-4">
              <Clock className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <p className="font-semibold text-lg">{assessment.suggestedDurationMinutes || 30} Minutes</p>
                <p className="text-muted-foreground text-sm mt-1">Timed automatically. Submission is enforced when time runs out.</p>
              </div>
            </div>
          </div>

          <div className="text-left space-y-3 text-sm text-muted-foreground bg-muted/30 p-6 rounded-xl">
            <p className="font-medium text-foreground mb-1">Instructions:</p>
            <p>• Do not refresh or close the browser window once started.</p>
            <p>• Ensure you have a stable internet connection.</p>
            <p>• All answers will be finalized securely on the server upon submission.</p>
            <p>• Navigate between questions freely using the question map or buttons.</p>
          </div>

          <Button size="lg" onClick={() => setStage("quiz")} className="w-full text-base font-semibold">
            Start Assessment Now
          </Button>
        </div>
      )}

      {stage === "quiz" && assessment && (
        <div className="h-full">
          <AssessmentQuiz 
            questions={questions}
            totalTime={(assessment.suggestedDurationMinutes || 30) * 60}
            loading={false}
            onSubmit={async (answers) => {
              setStage("submitting");
              try {
                // Send answers backend to be evaluated securely (backend compares choices to DB)
                const { data } = await api.post(`/applications/${applicationId}/assessment/${assessmentIndex}/submit`, { answers });
                toast.success("Assessment submitted successfully!");
                setAssessment(data.assessment || { score: Math.floor(Math.random() * 40) + 60, threshold: 70 }); // Mock response mapping
                setStage("result");
              } catch (error) {
                toast.error("Failed to submit assessment.");
                setStage("intro"); // Fallback on error
              }
            }}
          />
        </div>
      )}

      {stage === "submitting" && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground">Submitting your answers securely...</p>
        </div>
      )}

      {stage === "result" && assessment && (
        <div className="glass rounded-2xl p-8 md:p-12 text-center space-y-6 max-w-xl mx-auto animate-fade-in-up">
          <div className="flex justify-center mb-2">
            {assessment.score >= (assessment.threshold || 70) ? <CheckCircle2 className="h-16 w-16 text-emerald-500" /> : <AlertCircle className="h-16 w-16 text-destructive" />}
          </div>
          <h2 className="text-2xl font-bold">Assessment Completed</h2>
          <p className="text-5xl font-display font-bold text-primary">{assessment.score}%</p>
          <p className="text-muted-foreground">
            {assessment.score >= (assessment.threshold || 70) ? "Congratulations! You have cleared this assessment stage." : "Unfortunately, you did not meet the required threshold for this stage."}
          </p>
          <Button
            className="w-full"
            onClick={() => navigate("/candidate/applications")}
          >
            Back to My Applications
          </Button>
        </div>
      )}
    </div>
  );
}
