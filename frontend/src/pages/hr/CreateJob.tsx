import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateJobDescription, type AIGeneratedJD } from "@/lib/ai-service";
import api from "@/api/api";

export default function CreateJob() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [notes, setNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // State to hold the AI output before saving
  const [generatedJD, setGeneratedJD] = useState<AIGeneratedJD | null>(null);

  const handleGenerate = async () => {
    if (!title) return toast.error("Job Title is required to generate a JD!");
    setIsGenerating(true);
    try {
      const data = await generateJobDescription(title, notes);
      setGeneratedJD(data);
      toast.success("Job Description generated successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to generate AI JD");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!title || !location || !generatedJD) {
      return toast.error("Please fill all fields and generate a JD first.");
    }
    setIsPublishing(true);
    try {
      await api.post("/jobs", {
        title,
        location,
        type,
        job_description: generatedJD
      });
      toast.success("Job published successfully!");
      navigate("/hr/jobs");
    } catch (error: any) {
      toast.error("Failed to publish job");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold font-display">Create New Job</h1>
      
      <div className="glass p-6 rounded-xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Job Title</label>
            <input className="w-full p-2 rounded-md bg-background border" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend Engineer" />
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <input className="w-full p-2 rounded-md bg-background border" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote, NY" />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Recruiter Notes (for AI)</label>
          <textarea 
            className="w-full p-2 rounded-md bg-background border min-h-[100px]" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Type some brief requirements, and the AI will expand it into a full Job Description..." 
          />
        </div>

        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
          {isGenerating ? "✨ AI is thinking..." : "✨ Generate Job Description"}
        </Button>
      </div>

      {/* Step 2: Review and Publish */}
      {generatedJD && (
        <div className="glass p-6 rounded-xl space-y-6 animate-fade-in border border-primary/50">
          <h2 className="text-2xl font-bold text-primary">Preview AI Generated JD</h2>
          <p className="text-muted-foreground">{generatedJD.job_summary}</p>
          
          <div>
            <h4 className="font-semibold mb-2">Mandatory Skills</h4>
            <div className="flex gap-2 flex-wrap">
              {generatedJD.mandatory_technical_skills.map((skill) => (
                <Badge key={skill} variant="default">{skill}</Badge>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground italic">
            Note: You will be able to edit these fields soon.
          </p>

          <Button onClick={handlePublish} disabled={isPublishing} variant="default" className="w-full bg-emerald-600 hover:bg-emerald-700">
            {isPublishing ? "Publishing..." : "Publish Job to Board"}
          </Button>
        </div>
      )}
    </div>
  );
}