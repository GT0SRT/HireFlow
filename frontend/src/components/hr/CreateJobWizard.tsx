import { useState } from "react";
import type { ChangeEvent } from "react";
import { X, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const STEPS = ["Job Details", "Assessments", "Interviews", "Documents", "Team Allocation"];

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

interface StepDocumentsProps {
  docs: Record<string, boolean>;
  setDocs: (docs: Record<string, boolean>) => void;
  options: string[];
}

interface CreateJobWizardProps {
  onClose: () => void;
}

export default function CreateJobWizard({ onClose }: CreateJobWizardProps) {
  const [step, setStep] = useState(0);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [docs, setDocs] = useState<Record<string, boolean>>({});

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

  const docOptions = [
    "Aadhaar Card",
    "PAN Card",
    "10th Marksheet",
    "12th Marksheet",
    "Degree Certificate",
    "Experience Letter",
    "Passport",
  ];

  const handlePublish = () => {
    toast.success("Recruitment published successfully!");
    onClose();
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

          <button
            type="button"
            onClick={onClose}
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
          {step === 0 && <StepJobDetails />}
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
          {step === 3 && (
            <StepDocuments docs={docs} setDocs={setDocs} options={docOptions} />
          )}
          {step === 4 && <StepTeamAllocation />}
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
            <Button onClick={handlePublish} className="glow-primary gap-2">
              Publish Recruitment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------ Step Components ------------------ */

function StepJobDetails() {
  return (
    <div className="space-y-4">
      <div>
        <Label>Job Title</Label>
        <Input
          placeholder="e.g. Senior Frontend Developer"
          className="mt-1.5 glass"
        />
      </div>

      <div>
        <Label>Job Description</Label>
        <Textarea
          placeholder="Describe the role..."
          className="mt-1.5 glass"
          rows={4}
        />
      </div>

      <div>
        <Label>Required Skills</Label>
        <Input
          placeholder="React, TypeScript, Node.js"
          className="mt-1.5 glass"
        />
      </div>

      <div>
        <Label>Requirements</Label>
        <Textarea
          placeholder="List the requirements..."
          className="mt-1.5 glass"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Last Date to Apply</Label>
          <Input type="date" className="mt-1.5 glass" />
        </div>

        <div>
          <Label>Experience Level</Label>
          <Select>
            <SelectTrigger className="mt-1.5 glass">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior Level</SelectItem>
              <SelectItem value="lead">Lead / Principal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Qualification</Label>
        <Select>
          <SelectTrigger className="mt-1.5 glass">
            <SelectValue placeholder="Select qualification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
            <SelectItem value="master">Master's Degree</SelectItem>
            <SelectItem value="phd">PhD</SelectItem>
            <SelectItem value="any">Any</SelectItem>
          </SelectContent>
        </Select>
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

/* ---------------- Documents Step ---------------- */

function StepDocuments({ docs, setDocs, options }: StepDocumentsProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select which documents are required before extending an offer.
      </p>

      <div className="glass rounded-xl p-5 space-y-4">
        {options.map((doc) => (
          <div key={doc} className="flex items-center gap-3">
            <Checkbox
              checked={docs[doc] || false}
              onCheckedChange={(v: boolean | "indeterminate") =>
                setDocs({ ...docs, [doc]: !!v })
              }
            />
            <Label className="cursor-pointer">{doc}</Label>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Team Allocation Step ---------------- */

function StepTeamAllocation() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Assign the successful candidate to a team or project.
      </p>

      <div>
        <Label>Team / Project</Label>
        <Select>
          <SelectTrigger className="mt-1.5 glass">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="data">Data Science</SelectItem>
            <SelectItem value="devops">DevOps</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Project Name (optional)</Label>
        <Input
          placeholder="e.g. Project Phoenix"
          className="mt-1.5 glass"
        />
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea
          placeholder="Any additional notes for onboarding..."
          className="mt-1.5 glass"
          rows={3}
        />
      </div>
    </div>
  );
}