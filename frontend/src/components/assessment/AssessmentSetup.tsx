import { useState } from "react";

import {
  Clock,
  Hash,
  AlertCircle,
} from "lucide-react";

import { useUserStore } from "../../store/useUserStore";

const cn = (...classes: string[]) =>
  classes.filter(Boolean).join(" ");

interface AssessmentForm {
  company: string;

  role_name: string;

  topics: string;

  difficulty: string;

  noOfQuestions: number;

  totalTime: number;
}

interface DifficultyLevel {
  id: string;

  label: string;
}

interface AssessmentSetupProps {
  onStart: (form: AssessmentForm) => void;

  loading: boolean;
}

const AssessmentSetup = ({
  onStart,
  loading,
}: AssessmentSetupProps) => {
  const theme = useUserStore(
    (state) => state.theme
  );

  const isDark = theme === "dark";

  const [form, setForm] =
    useState<AssessmentForm>({
      company: "",

      role_name: "",

      topics: "",

      difficulty: "moderate",

      noOfQuestions: 5,

      totalTime: 300,
    });

  const update = (
    key: keyof AssessmentForm,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    onStart(form);
  };

  const difficultyLevels: DifficultyLevel[] = [
    {
      id: "easy",
      label: "Easy",
    },
    {
      id: "moderate",
      label: "Moderate",
    },
    {
      id: "hard",
      label: "Hard",
    },
  ];

  return (
    <div className={cn("min-h-screen py-2 px-2 bg-transparent", isDark ? "text-slate-100" : "text-slate-900")}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className={cn("text-3xl font-bold", isDark ? "text-white" : "text-slate-900")}>Assessment Practice</h1>
            <p className={cn("mt-1 text-md", isDark ? "text-slate-400" : "text-slate-600")}>
              Configure your setup and take an AI-powered assessment.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={cn("rounded-2xl border p-7", isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white")}
        >
          <div className="space-y-5">
            <div>
              <label className={cn("block text-sm font-medium mb-2", isDark ? "text-slate-300" : "text-slate-700")}>
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="e.g. Google, Amazon, Microsoft"
                className={cn(
                  "w-full rounded-lg border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500",
                  isDark ? "border-slate-600 bg-slate-700 text-white placeholder:text-slate-400" : "border-gray-300 bg-white"
                )}
              />
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", isDark ? "text-slate-300" : "text-slate-700")}>
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.role_name}
                onChange={(e) => update("role_name", e.target.value)}
                placeholder="e.g. Software Engineer, Product Manager"
                className={cn(
                  "w-full rounded-lg border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500",
                  isDark ? "border-slate-600 bg-slate-700 text-white placeholder:text-slate-400" : "border-gray-300 bg-white"
                )}
              />
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", isDark ? "text-slate-300" : "text-slate-700")}>
                Topics to Assess <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.topics}
                onChange={(e) => update("topics", e.target.value)}
                placeholder="e.g. DSA, System Design, React"
                className={cn(
                  "w-full rounded-lg border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-500",
                  isDark ? "border-slate-600 bg-slate-700 text-white placeholder:text-slate-400" : "border-gray-300 bg-white"
                )}
              />
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-3", isDark ? "text-slate-300" : "text-slate-700")}>
                Assessment Difficulty
              </label>
              <div className="grid grid-cols-3 gap-3">
                {difficultyLevels.map((level) => (
                  <button
                    type="button"
                    key={level.id}
                    onClick={() => update("difficulty", level.id)}
                    className={cn(
                      "rounded-md px-2 py-1 font-semibold text-white transition",
                      form.difficulty === level.id ? "bg-cyan-500/40 ring-1 ring-cyan-500 ring-offset-2" : "bg-cyan-500/40 hover:bg-cyan-500/50 ring-1 ring-cyan-500",
                      isDark ? "" : "ring-offset-gray-50"
                    )}
                  >
                    <p className="text-sm">{level.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={cn("block text-sm font-medium mb-2", isDark ? "text-slate-300" : "text-slate-700")}>
                  Questions
                </label>
                <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2.5", isDark ? "border-slate-600 bg-slate-700" : "border-gray-300 bg-white")}>
                  <Hash className={cn("h-4 w-4", isDark ? "text-slate-400" : "text-gray-500")} />
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={form.noOfQuestions}
                    onChange={(e) => update("noOfQuestions", parseInt(e.target.value, 10) || 1)}
                    aria-label="Number of Questions"
                    className={cn("w-full bg-transparent text-sm outline-none", isDark ? "text-white" : "text-slate-900")}
                  />
                </div>
              </div>

              <div>
                <label className={cn("block text-sm font-medium mb-2", isDark ? "text-slate-300" : "text-slate-700")}>
                  Time (seconds)
                </label>
                <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2.5", isDark ? "border-slate-600 bg-slate-700" : "border-gray-300 bg-white")}>
                  <Clock className={cn("h-4 w-4", isDark ? "text-slate-400" : "text-gray-500")} />
                  <input
                    type="number"
                    min={60}
                    required
                    value={form.totalTime}
                    aria-label="Total Time in seconds"
                    onChange={(e) => update("totalTime", parseInt(e.target.value, 10) || 60)}
                    className={cn("w-full bg-transparent text-sm outline-none", isDark ? "text-white" : "text-slate-900")}
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full rounded-lg px-4 py-3 font-semibold text-white transition",
                loading ? "bg-cyan-500/70 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"
              )}
            >
              {loading ? "Generating Assessment..." : "Start Assessment"}
            </button>

            <p className={cn("text-xs flex items-center gap-2", isDark ? "text-slate-400" : "text-slate-500")}>
              <AlertCircle className="h-3.5 w-3.5" />
              Your timer starts as soon as questions are generated.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentSetup;