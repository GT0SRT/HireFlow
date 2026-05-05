import { useEffect, useState, useRef } from "react";
import { User, Upload, Plus, X, Save, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/api/api";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  resume?: string;
  role: string;
  company?: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/profile/me")
      .then(({ data }) => {
        setProfile(data);
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
        setLocation(data.location ?? "");
        setBio(data.bio ?? "");
        setSkills(data.skills ?? []);
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/profile/update", {
        name, phone, location, bio, skills,
      });
      setProfile(data);
      toast.success("Profile saved successfully!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      toast.error("Skill already added");
      return;
    }
    setSkills(prev => [...prev, trimmed]);
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    setUploading(true);
    try {
      const { data } = await api.post("/profile/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(prev => prev ? { ...prev, resume: data.resume } : prev);
      toast.success("Resume uploaded successfully!");
    } catch {
      toast.error("Failed to upload resume");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="max-w-3xl">

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      {/* Avatar Card */}
      <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold">{profile?.name}</h2>
            <p className="text-muted-foreground">{profile?.email}</p>
            {profile?.role === "hr" && profile?.company && (
              <Badge variant="outline" className="mt-1 text-primary border-primary/30">
                {profile.company}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div
        className="glass rounded-2xl p-6 mb-6 space-y-5 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <h3 className="font-display font-semibold text-lg">Personal Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Full Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1.5 glass"
              placeholder="Rahul Agrahari"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              value={profile?.email ?? ""}
              className="mt-1.5 glass opacity-60"
              disabled
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="mt-1.5 glass"
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="mt-1.5 glass"
              placeholder="Mumbai, India"
            />
          </div>
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="mt-1.5 glass"
            rows={3}
            placeholder="Tell recruiters about yourself..."
          />
        </div>
      </div>

      {/* Resume — Candidate only */}
      {profile?.role === "candidate" && (
        <div
          className="glass rounded-2xl p-6 mb-6 animate-fade-in"
          style={{ animationDelay: "0.15s" }}
        >
          <h3 className="font-display font-semibold text-lg mb-4">Resume</h3>

          {/* Already uploaded */}
          {profile.resume && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Resume uploaded</p>
                <p className="text-xs text-muted-foreground">
                  {profile.resume.split("/").pop()}
                </p>
              </div>
              <a href={profile.resume} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </Button>
              </a>
            </div>
          )}

          {/* Upload area */}
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              {profile.resume ? "Upload new resume" : "Drop your resume here or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground">PDF, DOC, DOCX — Max 5MB</p>
            {uploading && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                <span className="text-xs text-primary">Uploading...</span>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
          />
        </div>
      )}

      {/* Skills — Candidate only */}
      {profile?.role === "candidate" && (
        <div
          className="glass rounded-2xl p-6 mb-6 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="font-display font-semibold text-lg mb-4">Skills</h3>
          <div className="flex gap-2 mb-4">
            <Input
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              placeholder="e.g. React, Python, Figma"
              className="glass"
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addSkill}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <Badge
                  key={s}
                  variant="outline"
                  className="px-3 py-1.5 bg-primary/5 border-primary/20 text-primary gap-2"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No skills added yet. Type a skill and press Enter or click +
            </p>
          )}
        </div>
      )}

      {/* Save Button */}
      <Button
        className="glow-primary-sm gap-2"
        onClick={handleSave}
        disabled={saving}
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </Button>

    </div>
  );
}