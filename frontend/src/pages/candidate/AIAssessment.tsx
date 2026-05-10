import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import AssessmentSetup from "@/components/assessment/AssessmentSetup";
import AssessmentQuiz from "@/components/assessment/AssessmentQuiz";
import AssessmentResults from "@/components/assessment/AssessmentResults";
import {
  createAssessmentRecord,
  getAssessmentHistory,
} 
from "../../services/assessmentService";

interface Question {
  id: string;
  question: string;
  options: string[];
  topic: string;
  difficulty: string;
}

interface Metrics {
  technicalKnowledge: number;
  accuracy: number;
}

interface QuestionAnalysis {
  question: string;
  candidateAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  solution: string;
  topic: string;
}

interface AnalysisResult {
  company: string;
  role_name: string;
  difficulty: string;
  overallScore: number;
  correctAnswers: number;
  totalQuestions: number;
  metrics: Metrics;
  topicsCovered: string[];
  strengths: string[];
  weaknesses: string;
  feedback: string;
  questionsAnalysis: QuestionAnalysis[];
}

interface AssessmentInput {
  company?: string;
  role_name?: string;
  difficulty?: string;
  totalTime?: number;
  [key: string]: any;
}

export default function AIAssessment(): JSX.Element {
  const location = useLocation();

  const [phase, setPhase] = useState<"setup" | "quiz" | "results">(
    "setup"
  );

  const AI_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(
    /\/$/,
    ""
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalTime, setTotalTime] = useState<number>(300);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [assessmentInput, setAssessmentInput] =
    useState<AssessmentInput | null>(null);
  const [_historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [_assessmentHistory, setAssessmentHistory] = useState<any[]>([]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("assessment-phase-change", {
        detail: { phase },
      })
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("assessment-phase-change", {
          detail: { phase: "setup" },
        })
      );
    };
  }, [phase]);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);

      try {
        const history = await getAssessmentHistory();

        if (!cancelled) {
          setAssessmentHistory(history);
        }
      } catch (err) {
        console.error("Failed to fetch assessment history:", err);
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const selected = location?.state?.selectedAssessment;

    if (!selected || typeof selected !== "object") return;

    setAnalysis(selected);
    setPhase("results");
    setLoading(false);
  }, [location?.state]);

  const normalizeQuestions = (items: any[] = []): Question[] =>
    items.map((item, index) => ({
      id: item.id ?? index + 1,
      question: item.question || "",
      options: Array.isArray(item.options) ? item.options : [],
      topic: item.topic || "General",
      difficulty: item.difficulty || "moderate",
    }));

  const normalizeAnalysis = (
    result: any,
    fallback: AssessmentInput | null
  ): AnalysisResult => {
    const toDetailedArray = (value: any): any[] => {
      if (Array.isArray(value)) return value;

      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);

          return Array.isArray(parsed)
            ? parsed
            : parsed && typeof parsed === "object"
            ? Object.values(parsed)
            : [];
        } catch {
          return [];
        }
      }

      if (value && typeof value === "object") {
        return Object.values(value);
      }

      return [];
    };

    const detailedCandidates = [
      toDetailedArray(result?.detailed_analysis),
      toDetailedArray(result?.detailedAnalysis),
      toDetailedArray(result?.questionsAnalysis),
      toDetailedArray(result?.question_analysis),
    ];

    const detailed =
      detailedCandidates.find(
        (entry) => Array.isArray(entry) && entry.length > 0
      ) || [];

    const improvements = result?.improvements || [];

    return {
      company:
        result?.company || fallback?.company || "Tech Company",

      role_name:
        result?.role_name ||
        fallback?.role_name ||
        "Software Engineer",

      difficulty:
        result?.difficulty ||
        fallback?.difficulty ||
        "moderate",

      overallScore:
        result?.overall_score ??
        result?.overallScore ??
        0,

      correctAnswers:
        result?.correct_answers ??
        result?.correctAnswers ??
        0,

      totalQuestions:
        result?.total_questions ??
        result?.totalQuestions ??
        detailed.length,

      metrics: {
        technicalKnowledge:
          result?.metrics?.technical_knowledge ??
          result?.metrics?.technicalKnowledge ??
          0,

        accuracy: result?.metrics?.accuracy ?? 0,
      },

      topicsCovered:
        result?.topics_covered ||
        result?.topicsCovered ||
        [],

      strengths: result?.strengths || [],

      weaknesses: Array.isArray(improvements)
        ? improvements.join(" ")
        : result?.weaknesses || "",

      feedback: result?.feedback || "",

      questionsAnalysis: detailed.map(
        (item: any, index: number): QuestionAnalysis => {
          const question =
            item?.question ??
            item?.question_text ??
            item?.prompt ??
            item?.query ??
            `Question ${index + 1}`;

          const candidateAnswer =
            item?.candidate_answer ??
            item?.candidateAnswer ??
            item?.user_answer ??
            item?.userAnswer ??
            item?.selected_option ??
            item?.selectedOption ??
            "";

          const correctAnswer =
            item?.correct_answer ??
            item?.correctAnswer ??
            item?.expected_answer ??
            item?.expectedAnswer ??
            item?.correct_option ??
            item?.correctOption ??
            "";

          const explicitIsCorrect =
            item.is_correct ?? item.isCorrect;

          const inferredIsCorrect =
            String(candidateAnswer).trim().toLowerCase() ===
            String(correctAnswer).trim().toLowerCase();

          return {
            question,
            candidateAnswer,
            correctAnswer,

            isCorrect:
              typeof explicitIsCorrect === "boolean"
                ? explicitIsCorrect
                : inferredIsCorrect,

            solution:
              item?.solution ??
              item?.explanation ??
              item?.analysis ??
              "",

            topic:
              item?.topic ||
              item?.category ||
              "General",
          };
        }
      ),
    };
  };

  const handleStart = async (
    input: AssessmentInput
  ): Promise<void> => {
    setLoading(true);

    try {
      if (!AI_API_BASE_URL) {
        throw new Error(
          "VITE_API_BASE_URL is not configured"
        );
      }

      const response = await fetch(
        `${AI_API_BASE_URL}/generate_assessment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Generate assessment failed: ${response.status}`
        );
      }

      const data = await response.json();

      const normalizedQuestions = normalizeQuestions(
        data.questions || []
      );

      if (!normalizedQuestions.length) {
        throw new Error(
          "No questions returned from ai-engine"
        );
      }

      setQuestions(normalizedQuestions);

      setTotalTime(
        data.total_time_sec ||
          input.totalTime ||
          300
      );

      setAssessmentInput(input);

      setPhase("quiz");
    } catch (err) {
      console.error(
        "Failed to generate assessment from ai-engine:",
        err
      );

      alert(
        "Unable to generate questions from ai-engine. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    answers: Record<string, string>
  ): Promise<void> => {
    setPhase("results");
    setAnalysis(null);
    setLoading(true);

    try {
      if (!AI_API_BASE_URL) {
        throw new Error(
          "VITE_API_BASE_URL is not configured"
        );
      }

      const userResponses = questions.map(
        (q) => answers[q.id] || ""
      );

      const response = await fetch(
        `${AI_API_BASE_URL}/assess_response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            ...(assessmentInput || {}),
            user_responses: userResponses,
            questions_asked: questions,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Assess response failed: ${response.status}`
        );
      }

      const result = await response.json();

      const normalizedResult = normalizeAnalysis(
        result,
        assessmentInput
      );

      setAnalysis(normalizedResult);

      try {
        await createAssessmentRecord({
          companyName: normalizedResult.company,
          roleName: normalizedResult.role_name,
          difficulty: normalizedResult.difficulty,
          overallScore: normalizedResult.overallScore,
          correctAnswers:
            normalizedResult.correctAnswers,
          totalQuestions:
            normalizedResult.totalQuestions,
          metrics: normalizedResult.metrics,
          topicsCovered:
            normalizedResult.topicsCovered,
          strengths: normalizedResult.strengths,
          improvements:
            normalizedResult.weaknesses,
          feedback: normalizedResult.feedback,
          detailedAnalysis:
            normalizedResult.questionsAnalysis,
        });

        const history =
          await getAssessmentHistory();

        setAssessmentHistory(history);
      } catch (persistErr) {
        console.error(
          "Failed to persist assessment result:",
          persistErr
        );
      }
    } catch (err) {
      console.error(
        "Failed to analyze assessment from ai-engine:",
        err
      );

      setPhase("quiz");

      alert(
        "Unable to analyze answers from ai-engine. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = (): void => {
    setPhase("setup");
    setQuestions([]);
    setTotalTime(300);
    setAnalysis(null);
    setAssessmentInput(null);
  };

  if (phase === "setup") {
    return (
      <AssessmentSetup
        onStart={handleStart}
        loading={loading}
      />
    );
  }

  if (phase === "quiz") {
    return (
      <AssessmentQuiz
        questions={questions}
        totalTime={totalTime}
        onSubmit={handleSubmit}
        loading={loading}
      />
    );
  }

  return (
    <AssessmentResults
      result={analysis}
      loading={loading}
      onRestart={handleRestart}
    />
  );
}