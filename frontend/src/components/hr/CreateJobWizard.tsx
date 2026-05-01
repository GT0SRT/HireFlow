import { useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { X, ChevronLeft, ChevronRight, Plus, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { toast } from "sonner";
import api from "@/api/api";
import keywordsData from "@/lib/keywords.json";
import { generateJobDescription } from "@/lib/ai-service";

const STEPS = ["Job Details", "Assessments", "Interviews"];

interface Assessment {
  title: string;
  difficulty: string;
  numQuestions: string;
  topics: string;
  isCoding: boolean;
}

interface Interview {
  title: string;
  topics: string;
  difficulty: string;
  isAI: boolean;
  meetingLink: string;
}

interface CreateJobWizardProps {
  onClose: () => void;
}

interface JobFormData {
  title: string;
  description: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  skills: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
}

export default function CreateJobWizard({ onClose }: CreateJobWizardProps) {
  const [step, setStep] = useState(0);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [jobForm, setJobForm] = useState<JobFormData>({
    title: "",
    description: "",
    location: "",
    type: "Full-time",
    skills: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "INR",
  });

  const addAssessment = () =>
    setAssessments((p) => [
      ...p,
      { title: "", difficulty: "medium", numQuestions: "", topics: "", isCoding: false },
    ]);

  const removeAssessment = (i: number) =>
    setAssessments((p) => p.filter((_, idx) => idx !== i));

  const updateAssessment = (
    i: number,
    field: keyof Assessment,
    val: string | boolean
  ) => {
    setAssessments((p) =>
      p.map((a, idx) => (idx === i ? { ...a, [field]: val } : a))
    );
  };

  const addInterview = () =>
    setInterviews((p) => [
      ...p,
      { title: "", topics: "", difficulty: "medium", isAI: true, meetingLink: "" },
    ]);

  const removeInterview = (i: number) =>
    setInterviews((p) => p.filter((_, idx) => idx !== i));

  const updateInterview = (
    i: number,
    field: keyof Interview,
    val: string | boolean
  ) => {
    setInterviews((p) =>
      p.map((a, idx) => (idx === i ? { ...a, [field]: val } : a))
    );
  };

  const handlePublish = async () => {
    if (!jobForm.title.trim() || !jobForm.description.trim() || !jobForm.location.trim()) {
      toast.error("Please fill title, description and location");
      return;
    }

    const minSalary = Number(jobForm.salaryMin || 0);
    const maxSalary = Number(jobForm.salaryMax || 0);

    if (minSalary < 0 || maxSalary < 0 || (maxSalary > 0 && maxSalary < minSalary)) {
      toast.error("Please enter a valid salary range");
      return;
    }

    try {
      setPublishing(true);
      await api.post("/jobs", {
        title: jobForm.title.trim(),
        description: jobForm.description.trim(),
        location: jobForm.location.trim(),
        type: jobForm.type,
        skills: jobForm.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        salary: {
          min: minSalary || undefined,
          max: maxSalary || undefined,
          currency: jobForm.salaryCurrency,
        },
      });

      toast.success("Job published successfully");
      onClose();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to publish job";
      toast.error(message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-display font-bold">Create New Job</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </p>
          </div>

          <button type="button" onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {step === 0 && <StepJobDetails form={jobForm} setForm={setJobForm} jobTitles={keywordsData.jobTitles} skills={keywordsData.skills} />}
          {step === 1 && (
            <StepAssessments
              assessments={assessments}
              onAdd={addAssessment}
              onRemove={removeAssessment}
              onUpdate={updateAssessment}
            />
          )}
          {step === 2 && (
            <StepInterviews
              interviews={interviews}
              onAdd={addInterview}
              onRemove={removeInterview}
              onUpdate={updateInterview}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border/50">
          <Button
            variant="outline"
            onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="gap-2 glow-primary-sm">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} className="glow-primary gap-2" disabled={publishing}>
              {publishing ? "Publishing..." : "Publish Recruitment"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------ Step Components ------------------ */

function StepJobDetails({
  form,
  setForm,
  jobTitles,
  skills,
}: {
  form: JobFormData;
  setForm: Dispatch<SetStateAction<JobFormData>>;
  jobTitles: string[];
  skills: string[];
}) {
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const handleGenerateDescription = async () => {
    if (!form.title.trim()) {
      toast.error("Please enter a job title first");
      return;
    }

    setGeneratingDescription(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const generated = generateJobDescription(form.title, form.description);
    setForm((prev) => ({ ...prev, description: generated }));
    
    setGeneratingDescription(false);
    toast.success("Job description generated!");
  };
  return (
    <div className="space-y-4">
      <div>
        <Label>Job Title</Label>
        <AutocompleteInput
          placeholder="e.g. Senior Frontend Developer"
          className="mt-1.5"
          value={form.title}
          onChange={(val) => setForm((prev) => ({ ...prev, title: val }))}
          suggestions={jobTitles}
          isSingleSelect
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label>Job Description</Label>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={generatingDescription || !form.title.trim()}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="h-3 w-3" />
            {generatingDescription ? "Generating..." : "AI Generate"}
          </button>
        </div>
        <Textarea
          placeholder="Describe the role... (or click AI Generate to auto-fill)"
          className="mt-1.5 glass"
          rows={6}
          value={form.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground mt-1">
          💡 Tip: AI will enhance your description if you provide one, or generate from scratch using just the title
        </p>
      </div>

      <div>
        <Label>Required Skills</Label>
        <AutocompleteInput
          placeholder="React, TypeScript, Node.js"
          className="mt-1.5"
          value={form.skills}
          onChange={(val) => setForm((prev) => ({ ...prev, skills: val }))}
          suggestions={skills}
          isSingleSelect={false}
        />
      </div>

      <div>
        <div>
          <Label>Location</Label>
          <Input
            placeholder="e.g. Bengaluru"
            className="mt-1.5 glass"
            value={form.location}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm((prev) => ({ ...prev, location: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label>Employment Type</Label>
          <Select
            value={form.type}
            onValueChange={(v: JobFormData["type"]) => setForm((prev) => ({ ...prev, type: v }))}
          >
            <SelectTrigger className="mt-1.5 glass">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Salary Min</Label>
          <Input
            type="number"
            placeholder="500000"
            className="mt-1.5 glass"
            value={form.salaryMin}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm((prev) => ({ ...prev, salaryMin: e.target.value }))
            }
          />
        </div>

        <div>
          <Label>Salary Max</Label>
          <Input
            type="number"
            placeholder="1200000"
            className="mt-1.5 glass"
            value={form.salaryMax}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm((prev) => ({ ...prev, salaryMax: e.target.value }))
            }
          />
        </div>

        <div>
          <Label>Currency</Label>
          <Select
            value={form.salaryCurrency}
            onValueChange={(v) => setForm((prev) => ({ ...prev, salaryCurrency: v }))}
          >
            <SelectTrigger className="mt-1.5 glass">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR - Indian Rupee</SelectItem>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="AED">AED - UAE Dirham</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Assessments Step ---------------- */

function StepAssessments({
  assessments,
  onAdd,
  onRemove,
  onUpdate,
}: {
  assessments: Assessment[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, f: keyof Assessment, v: string | boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add assessments that candidates must complete.
      </p>

      {assessments.map((a, i) => (
        <div key={i} className="glass rounded-xl p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-semibold">Assessment {i + 1}</h4>
            <button
              onClick={() => onRemove(i)}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div>
            <Label>Assessment Title</Label>
            <Input
              value={a.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdate(i, "title", e.target.value)
              }
              className="mt-1.5 glass"
              placeholder="e.g. JavaScript Fundamentals"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Difficulty Level</Label>
              <Select
                value={a.difficulty}
                onValueChange={(v: string) => onUpdate(i, "difficulty", v)}
              >
                <SelectTrigger className="mt-1.5 glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Number of Questions</Label>
              <Input
                type="number"
                value={a.numQuestions}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onUpdate(i, "numQuestions", e.target.value)
                }
                className="mt-1.5 glass"
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <Label>Topics (comma separated)</Label>
            <Input
              value={a.topics}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdate(i, "topics", e.target.value)
              }
              className="mt-1.5 glass"
              placeholder="Arrays, Closures, Promises"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={a.isCoding}
              onCheckedChange={(v: boolean) => onUpdate(i, "isCoding", v)}
            />
            <Label>Is this a Coding Assessment?</Label>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={onAdd}
        className="w-full gap-2 border-dashed border-2"
      >
        <Plus className="h-4 w-4" />
        Add Assessment
      </Button>
    </div>
  );
}

/* ---------------- Interviews Step ---------------- */

function StepInterviews({
  interviews,
  onAdd,
  onRemove,
  onUpdate,
}: {
  interviews: Interview[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, f: keyof Interview, v: string | boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configure interview rounds for this position.
      </p>

      {interviews.map((iv, i) => (
        <div key={i} className="glass rounded-xl p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-semibold">
              Interview Round {i + 1}
            </h4>

            <button
              onClick={() => onRemove(i)}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div>
            <Label>Interview Title</Label>
            <Input
              value={iv.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdate(i, "title", e.target.value)
              }
              className="mt-1.5 glass"
              placeholder="e.g. Technical Round 1"
            />
          </div>

          <div>
            <Label>Topics</Label>
            <Input
              value={iv.topics}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onUpdate(i, "topics", e.target.value)
              }
              className="mt-1.5 glass"
              placeholder="System Design, DSA"
            />
          </div>

          <div>
            <Label>Difficulty Level</Label>
            <Select
              value={iv.difficulty}
              onValueChange={(v: string) => onUpdate(i, "difficulty", v)}
            >
              <SelectTrigger className="mt-1.5 glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={iv.isAI}
              onCheckedChange={(v: boolean) => onUpdate(i, "isAI", v)}
            />
            <Label>{iv.isAI ? "AI Interview" : "Human Interview"}</Label>
          </div>

          {!iv.isAI && (
            <div className="animate-fade-in">
              <Label>Meeting Link</Label>
              <Input
                value={iv.meetingLink}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onUpdate(i, "meetingLink", e.target.value)
                }
                className="mt-1.5 glass"
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        onClick={onAdd}
        className="w-full gap-2 border-dashed border-2"
      >
        <Plus className="h-4 w-4" />
        Add Interview Round
      </Button>
    </div>
  );
}