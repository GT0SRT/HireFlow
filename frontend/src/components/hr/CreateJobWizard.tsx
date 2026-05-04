import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { generateJobDescription, type AIGeneratedJD } from "@/lib/ai-service";

const STEPS = ["Job Details", "HR Internal Plans"];

interface BaseInfo {
  title: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  notes: string;
  jobNumber?: string;
}

interface CreateJobWizardProps {
  onClose: () => void;
}

export default function CreateJobWizard({ onClose }: CreateJobWizardProps) {
  const [step, setStep] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [baseInfo, setBaseInfo] = useState<BaseInfo>({
    title: "",
    location: "Remote",
    type: "Full-time",
    notes: "",
  });
  
  const [generatedJD, setGeneratedJD] = useState<AIGeneratedJD | null>(null);

  const handleGenerate = async () => {
    if (!baseInfo.title.trim()) {
      toast.error("Please enter a Job Title before generating.");
      return;
    }

    setGenerating(true);
    try {
      const data = await generateJobDescription(baseInfo.title, baseInfo.notes);
      setGeneratedJD(data);
      toast.success("Job description generated successfully!");
    } catch {
      toast.error("something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedJD) return;

    try {
      setPublishing(true);
      await api.post("/jobs", {
        title: baseInfo.title.trim(),
        location: baseInfo.location.trim() || "Remote",
        type: baseInfo.type,
        job_description: generatedJD
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
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col text-left">
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
          {step === 0 && (
            <StepInitialDetails 
              info={baseInfo} 
              setInfo={setBaseInfo} 
              jobTitles={keywordsData.jobTitles} 
              locations={keywordsData.locations || []}
              generatedJD={generatedJD}
              setGeneratedJD={setGeneratedJD}
            />
          )}
          {step === 1 && generatedJD && (
            <StepReviewPlans jd={generatedJD} setJD={setGeneratedJD} />
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

          {step === 0 ? (
          !generatedJD ? (
            <Button onClick={handleGenerate} disabled={generating} className="glow-primary gap-2">
              {generating ? "thinking..." : "Generate"}
            </Button>
          ) : (
            <Button onClick={() => setStep(1)} className="gap-2 glow-primary-sm">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )
          ) : step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="gap-2 glow-primary-sm">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} className="glow-primary gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={publishing}>
              {publishing ? "Publishing..." : "Publish Job to Board"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------ Step Components ------------------ */

function StepInitialDetails({
  info,
  setInfo,
  jobTitles,
  locations,
  generatedJD,
  setGeneratedJD
}: {
  info: BaseInfo;
  setInfo: Dispatch<SetStateAction<BaseInfo>>;
  jobTitles: string[];
  locations: string[];
  generatedJD: AIGeneratedJD | null;
  setGeneratedJD: Dispatch<SetStateAction<AIGeneratedJD | null>>;
}) {
  const [showJobNumber, setShowJobNumber] = useState(!!info.jobNumber);
  const [isEditingJD, setIsEditingJD] = useState(false);

  const updateField = <K extends keyof AIGeneratedJD>(field: K, value: AIGeneratedJD[K]) => {
    setGeneratedJD((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const updateArray = (field: keyof AIGeneratedJD, value: string, separator: string = ",") => {
    const arr = value.split(separator).map(s => s.trim()).filter(Boolean);
    setGeneratedJD(prev => prev ? { ...prev, [field]: arr } : prev);
  };

  return (
    <div className="space-y-4 text-left">
      <div>
        <Label>Job Title</Label>
        <AutocompleteInput
          placeholder="e.g. Senior Frontend Developer"
          className="mt-1.5"
          value={info.title}
          onChange={(val) => setInfo((prev) => ({ ...prev, title: val }))}
          suggestions={jobTitles}
          isSingleSelect
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Location</Label>
          <AutocompleteInput
            placeholder="e.g. Bengaluru"
            className="mt-1.5"
            value={info.location}
            onChange={(val) => setInfo((prev) => ({ ...prev, location: val }))}
            suggestions={locations}
            isSingleSelect
          />
        </div>
        <div>
          <Label>Employment Type</Label>
          <Select
            value={info.type}
            onValueChange={(v: BaseInfo["type"]) => setInfo((prev) => ({ ...prev, type: v }))}
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
      </div>

      <div className="pt-2">
        <Label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={showJobNumber}
            onChange={(e) => {
              setShowJobNumber(e.target.checked);
              if (!e.target.checked) setInfo((prev) => ({ ...prev, jobNumber: "" }));
            }}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <span>Add a custom Job Reference / ID (Optional)</span>
        </Label>
        {showJobNumber && (
          <Input
            placeholder="e.g. REQ-2026-001"
            className="mt-2 glass max-w-sm"
            value={info.jobNumber}
            onChange={(e) => setInfo((prev) => ({ ...prev, jobNumber: e.target.value }))}
          />
        )}
      </div>

      <div className="pt-4 mt-2 border-t border-border/50">
        {!generatedJD ? (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-base font-semibold">Description (Optional)</Label>
            </div>
            <Textarea
              placeholder="Please enter Job Description or prompt for AI. E.g. 'Looking for a frontend engineer with 3 years experience in React and TypeScript. Should be able to write unit tests and work in an agile team.'"
              className="glass"
              rows={6}
              value={info.notes}
              onChange={(e) => setInfo((prev) => ({ ...prev, notes: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tip: Just list the core technologies, years of experience, and any special test you want.
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">AI Generated Job Description</Label>
              <Button variant="outline" size="sm" onClick={() => setIsEditingJD(!isEditingJD)} className="text-xs h-8">
                {isEditingJD ? "Done Editing" : "Edit Details"}
              </Button>
            </div>

            <div className="glass p-6 rounded-xl border-primary/20 space-y-5 relative bg-gradient-to-b from-primary/5 to-transparent">
              <div className="absolute top-4 right-4">
                 <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">✨ AI Optimized</Badge>
              </div>
              
              <div className="space-y-1.5">
                 <Label className="text-[10px] text-primary font-bold uppercase tracking-widest">Standardized Role</Label>
                 {isEditingJD ? (
                   <Input 
                      value={generatedJD.primary_role || ""} 
                      onChange={e => updateField("primary_role", e.target.value)} 
                      className="text-xl font-bold bg-background/50 border-transparent hover:border-border focus:border-border shadow-sm h-12" 
                   />
                 ) : (
                   <p className="text-xl font-bold pt-1">{generatedJD.primary_role}</p>
                 )}
              </div>

              <div className="space-y-1.5">
                 <Label className="text-[10px] text-primary font-bold uppercase tracking-widest">Job Summary</Label>
                 {isEditingJD ? (
                   <Textarea 
                      value={generatedJD.job_summary || ""} 
                      onChange={e => updateField("job_summary", e.target.value)} 
                      className="bg-background/50 border-transparent hover:border-border focus:border-border shadow-sm leading-relaxed resize-none text-muted-foreground" 
                      rows={3} 
                   />
                 ) : (
                   <p className="leading-relaxed text-muted-foreground pt-1">{generatedJD.job_summary}</p>
                 )}
              </div>
              <div className="space-y-1.5">
                 <Label className="text-[10px] text-primary font-bold uppercase tracking-widest">What to Expect (Candidate)</Label>
                 {isEditingJD ? (
                   <Textarea
                     value={generatedJD.test_description || ""}
                     onChange={e => updateField("test_description", e.target.value)}
                     className="bg-background/50 border-transparent hover:border-border focus:border-border shadow-sm leading-relaxed resize-none text-muted-foreground"
                     rows={3}
                   />
                 ) : (
                   <p className="leading-relaxed text-muted-foreground pt-1 whitespace-pre-wrap">{generatedJD.test_description}</p>
                 )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                     <Label className="text-[10px] text-primary font-bold uppercase tracking-widest">Experience Required</Label>
                     {isEditingJD ? (
                       <Input 
                          value={generatedJD.experience_years || ""} 
                          onChange={e => updateField("experience_years", e.target.value)} 
                          className="bg-background/50 border-transparent hover:border-border focus:border-border shadow-sm text-sm" 
                       />
                     ) : (
                       <p className="text-sm pt-1">{generatedJD.experience_years}</p>
                     )}
                 </div>
                 <div className="space-y-1.5">
                     <Label className="text-[10px] text-primary font-bold uppercase tracking-widest">Mandatory Skills (Comma separated)</Label>
                     {isEditingJD ? (
                       <Input 
                          value={generatedJD.mandatory_technical_skills?.join(", ") || ""} 
                          onChange={e => updateArray("mandatory_technical_skills", e.target.value)} 
                          className="bg-background/50 border-transparent hover:border-border focus:border-border shadow-sm text-sm" 
                       />
                     ) : (
                       <div className="flex flex-wrap gap-1.5 pt-1">
                         {generatedJD.mandatory_technical_skills?.map(skill => (
                           <Badge key={skill} variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">{skill}</Badge>
                         ))}
                       </div>
                     )}
                 </div>
              </div>

              <div className="space-y-1.5">
                 <Label className="text-[10px] text-primary font-bold uppercase tracking-widest">Key Responsibilities</Label>
                 {isEditingJD ? (
                   <Textarea 
                      value={generatedJD.key_responsibilities?.join("\n") || ""} 
                      onChange={e => updateArray("key_responsibilities", e.target.value, "\n")} 
                      className="bg-background/50 border-transparent hover:border-border focus:border-border shadow-sm leading-relaxed text-sm resize-none" 
                      rows={5} 
                   />
                 ) : (
                   <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pt-1">
                     {generatedJD.key_responsibilities?.map((resp, i) => (
                       <li key={i}>{resp}</li>
                     ))}
                   </ul>
                 )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-primary font-bold uppercase tracking-widest">Key Requirements</Label>
                  {isEditingJD ? (
                    <Textarea
                      value={generatedJD.mandatory_technical_skills?.join("\n") || ""}
                      onChange={e => updateArray("mandatory_technical_skills", e.target.value, "\n")}
                      className="bg-background/50 border-transparent hover:border-border focus:border-border shadow-sm leading-relaxed text-sm resize-none"
                      rows={4}
                    />
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pt-1">
                      {generatedJD.mandatory_technical_skills?.map((skill, i) => (
                        <li key={i}>{skill}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] text-primary font-bold uppercase tracking-widest">Additional Requirements</Label>
                  {isEditingJD ? (
                    <Textarea
                      value={generatedJD.requirements?.join("\n") || ""}
                      onChange={e => updateArray("requirements", e.target.value, "\n")}
                      className="bg-background/50 border-transparent hover:border-border focus:border-border shadow-sm leading-relaxed text-sm resize-none"
                      rows={4}
                    />
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pt-1">
                      {generatedJD.requirements?.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepReviewPlans({ jd, setJD }: { jd: AIGeneratedJD, setJD: Dispatch<SetStateAction<AIGeneratedJD | null>> }) {
  const [isEditingPlans, setIsEditingPlans] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex items-center justify-between -mb-2">
        <Label className="text-base font-semibold">AI Evaluation Plans</Label>
        <Button variant="outline" size="sm" onClick={() => setIsEditingPlans(!isEditingPlans)} className="text-xs h-8">
          {isEditingPlans ? "Done Editing" : "Edit Plans"}
        </Button>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <h3 className="text-sm uppercase tracking-wider font-semibold text-amber-500 mb-4 flex items-center gap-2">
          Internal Assessment Plan
        </h3>
        {(!jd.assessment_plan || jd.assessment_plan.length === 0) && (
          <p className="text-sm text-muted-foreground">No assessments generated for this role.</p>
        )}
        {jd.assessment_plan?.map((test, i) => (
          <div key={i} className="glass rounded-lg p-4 mb-3 border border-border/50">
             <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                   <Label className="text-xs">Test Type</Label>
                   {isEditingPlans ? (
                     <Input value={test.test_type || ""} onChange={e => {
                        const newPlan = [...(jd.assessment_plan || [])];
                        newPlan[i].test_type = e.target.value;
                        setJD({...jd, assessment_plan: newPlan});
                     }} className="mt-1 h-8 text-sm glass" />
                   ) : (
                     <p className="text-sm font-medium mt-1">{test.test_type}</p>
                   )}
                </div>
                <div>
                   <Label className="text-xs">Duration (Minutes)</Label>
                   {isEditingPlans ? (
                     <Input type="number" value={test.suggested_duration_minutes || 30} onChange={e => {
                        const newPlan = [...(jd.assessment_plan || [])];
                        newPlan[i].suggested_duration_minutes = Number(e.target.value);
                        setJD({...jd, assessment_plan: newPlan});
                     }} className="mt-1 h-8 text-sm glass" />
                   ) : (
                     <p className="text-sm font-medium mt-1">{test.suggested_duration_minutes}m</p>
                   )}
                </div>
             </div>
             <div>
                <Label className="text-xs">Topics</Label>
                {isEditingPlans ? (
                  <Input value={test.focus_topics?.join(", ") || ""} onChange={e => {
                      const newPlan = [...(jd.assessment_plan || [])];
                      newPlan[i].focus_topics = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                      setJD({...jd, assessment_plan: newPlan});
                  }} className="mt-1 h-8 text-sm glass" />
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {test.focus_topics?.map(topic => (
                      <Badge key={topic} variant="outline" className="text-xs">{topic}</Badge>
                    ))}
                  </div>
                )}
             </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <h3 className="text-sm uppercase tracking-wider font-semibold text-blue-500 mb-4 flex items-center gap-2">
          Internal Interview Plan
        </h3>
        {(!jd.interview_plan || jd.interview_plan.length === 0) && (
          <p className="text-sm text-muted-foreground">No interviews generated for this role.</p>
        )}
        {jd.interview_plan?.map((iv, i) => (
          <div key={i} className="glass rounded-lg p-4 mb-3 border border-border/50">
             <div className="mb-3">
                <Label className="text-xs">Interview Round</Label>
                {isEditingPlans ? (
                  <Input value={iv.interview_round || ""} onChange={e => {
                      const newPlan = [...(jd.interview_plan || [])];
                      newPlan[i].interview_round = e.target.value;
                      setJD({...jd, interview_plan: newPlan});
                  }} className="mt-1 h-8 text-sm glass" />
                ) : (
                  <p className="text-sm font-medium mt-1">{iv.interview_round}</p>
                )}
             </div>
             <div>
                <Label className="text-xs">Topics</Label>
                {isEditingPlans ? (
                  <Input value={iv.focus_topics?.join(", ") || ""} onChange={e => {
                      const newPlan = [...(jd.interview_plan || [])];
                      newPlan[i].focus_topics = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                      setJD({...jd, interview_plan: newPlan});
                  }} className="mt-1 h-8 text-sm glass" />
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {iv.focus_topics?.map(topic => (
                      <Badge key={topic} variant="outline" className="text-xs">{topic}</Badge>
                    ))}
                  </div>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}