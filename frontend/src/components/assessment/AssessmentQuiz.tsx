import { useState, useEffect } from "react";
import { Clock, ChevronLeft, ChevronRight, Send, CheckCircle2 } from "lucide-react";

export interface Question {
  id: string;
  question: string;
  options: string[];
  topic: string;
}

interface AssessmentQuizProps {
  questions: Question[];
  totalTime: number;
  onSubmit: (answers: Record<string, string>) => void;
  loading: boolean;
  onAnswersChange?: (answers: Record<string, string>) => void;
}

export default function AssessmentQuiz({ questions, totalTime, onSubmit, loading, onAnswersChange }: AssessmentQuizProps){
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(totalTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onSubmit(answers);
    }
  }, [timeLeft, answers, onSubmit]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  if (!questions || questions.length === 0) return null;

  const q = questions[current];
  const answered = Object.keys(answers).length;
  const unanswered = questions.length - answered;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft < 60;

  // const selectAnswer = (option: string) => {
  //   setAnswers((prev) => ({ ...prev, [q.id]: option }));
  // };

  const selectAnswer = (option: string) => {
  setAnswers((prev) => {
    const updated = { ...prev, [q.id]: option };
    onAnswersChange?.(updated);
    return updated;
  });
};

  const goToQuestion = (index: number) => setCurrent(index);
  const goPrevious = () => setCurrent((p) => Math.max(0, p - 1));
  const goNext = () => setCurrent((p) => Math.min(questions.length - 1, p + 1));

  return (
    <div className="flex flex-col h-full text-foreground animate-fade-in">
      {/* Header / Progress */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 rounded-t-2xl">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Question <span className="text-foreground font-semibold">{current + 1}</span> / {questions.length}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize hidden sm:inline-block">
              {q.topic || "General"}
            </span>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold ${
              isUrgent ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"
            }`}
          >
            <Clock className="w-4 h-4" />
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
        </div>

        <div className="h-1 w-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 lg:p-6">
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          
          {/* Question Section */}
          <section className="lg:col-span-8 glass border border-border/50 rounded-2xl p-5 md:p-8 animate-fade-in-up" key={current}>
            <h2 className="text-xl font-semibold mb-6 leading-relaxed">
              {q.question}
            </h2>

            <div className="space-y-3">
              {q.options.map((option, idx) => {
                const selected = answers[q.id] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(option)}
                    className={`w-full cursor-pointer text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-muted-foreground/30 hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                          selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm leading-relaxed ${selected ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                          {option}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-5">
              <span className={`text-xs font-medium ${answers[q.id] ? "text-primary" : "text-muted-foreground"}`}>
                {answers[q.id] ? "Option selected" : "Select an option"}
              </span>

              <div className="flex items-center gap-2">
                <button onClick={goPrevious} disabled={current === 0} className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium">
                  <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span>
                </button>

                {current < questions.length - 1 ? (
                  <button onClick={goNext} className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all text-sm font-medium">
                    <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => onSubmit(answers)} disabled={loading || answered < questions.length} className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm">
                    {loading ? "Analyzing..." : "Submit"} <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-4 glass border border-border/50 rounded-2xl p-5 h-fit lg:sticky lg:top-24">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Attempted</p>
                <p className="text-xl font-bold text-primary mt-1">{answered}</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Unattempted</p>
                <p className="text-xl font-bold mt-1">{unanswered}</p>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Questions Jump Map</h3>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((item, index) => {
                const isCurrent = index === current;
                const isMarked = Boolean(answers[item.id]);
                return (
                  <button key={item.id ?? index} onClick={() => goToQuestion(index)} className={`h-10 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center border ${isCurrent ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/30 ring-offset-1 ring-offset-background" : isMarked ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-transparent hover:border-border"}`}>
                    {isMarked ? <CheckCircle2 className="w-4 h-4 text-primary" /> : index + 1}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}