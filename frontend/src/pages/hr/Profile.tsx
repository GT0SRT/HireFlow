import { useEffect, useState } from "react";
import { Building2, Globe, Mail, MapPin, Save, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/api/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface CompanyProfileForm {
  company: string;
  website: string;
  location: string;
  industry: string;
  hiringEmail: string;
  about: string;
}

export default function HRProfile() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CompanyProfileForm>({
    company: "",
    website: "",
    location: "",
    industry: "",
    hiringEmail: "",
    about: "",
  });

  useEffect(() => {
    setForm({
      company: user?.company || "",
      website: user?.companyProfile?.website || "",
      location: user?.companyProfile?.location || "",
      industry: user?.companyProfile?.industry || "",
      hiringEmail: user?.companyProfile?.hiringEmail || "",
      about: user?.companyProfile?.about || "",
    });
  }, [user]);

  const handleSave = async () => {
    if (!form.company.trim()) {
      toast.error("Company name is required");
      return;
    }

    try {
      setSaving(true);
      await api.put("/auth/me", {
        company: form.company.trim(),
        companyProfile: {
          website: form.website.trim(),
          location: form.location.trim(),
          industry: form.industry.trim(),
          hiringEmail: form.hiringEmail.trim(),
          about: form.about.trim(),
        },
      });
      await refreshUser();
      toast.success("Company profile saved");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save company profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const completion = [form.company, form.website, form.location, form.industry, form.hiringEmail, form.about].filter(Boolean).length;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Company Profile</h1>
          <p className="text-muted-foreground mt-1">
            Minimal company details candidates may need during the recruitment process.
          </p>
        </div>
        <div className="glass rounded-xl px-4 py-3 text-sm">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">Profile completeness</p>
          <p className="font-semibold mt-1">{Math.round((completion / 6) * 100)}%</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">Basic Company Details</h2>
              <p className="text-sm text-muted-foreground">Keep this short and candidate-friendly.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Company Name</Label>
              <Input value={form.company} className="mt-1.5 glass" onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))} placeholder="Acme Corp" />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={form.website} className="mt-1.5 glass" onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))} placeholder="https://company.com" />
            </div>
            <div>
              <Label>Industry</Label>
              <Input value={form.industry} className="mt-1.5 glass" onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))} placeholder="SaaS / FinTech / E-commerce" />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} className="mt-1.5 glass" onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Bengaluru, India" />
            </div>
            <div>
              <Label>Hiring Email</Label>
              <Input value={form.hiringEmail} className="mt-1.5 glass" onChange={(e) => setForm((prev) => ({ ...prev, hiringEmail: e.target.value }))} placeholder="careers@company.com" />
            </div>
            <div className="md:col-span-2">
              <Label>About Company</Label>
              <Textarea
                value={form.about}
                className="mt-1.5 glass"
                rows={4}
                onChange={(e) => setForm((prev) => ({ ...prev, about: e.target.value }))}
                placeholder="A short note candidates can read during applications and interviews"
              />
            </div>
          </div>

          <Button className="glow-primary gap-2" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Company Profile"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.18em]">Candidate-facing details</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <UserRound className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Company name</p>
                  <p className="text-muted-foreground">Shown in job posts and application screens.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Website and industry</p>
                  <p className="text-muted-foreground">Useful for candidate trust and context.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">Helps candidates understand work location early.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Hiring email</p>
                  <p className="text-muted-foreground">For application and recruitment follow-ups.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-primary/80">Current Profile</p>
            <h3 className="mt-2 text-lg font-display font-semibold">{user?.company || "No company added yet"}</h3>
            <p className="text-sm text-muted-foreground mt-2">{user?.companyProfile?.about || "Add a short company summary for candidates."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}