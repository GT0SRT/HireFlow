import { User, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const skills = ["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "Tailwind CSS", "Docker", "AWS"];

export default function Profile() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      {/* Avatar & Name */}
      <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold">John Doe</h2>
            <p className="text-muted-foreground">Full Stack Developer</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="glass rounded-2xl p-6 mb-6 space-y-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <h3 className="font-display font-semibold text-lg">Personal Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Full Name</Label>
            <Input defaultValue="John Doe" className="mt-1.5 glass" />
          </div>
          <div>
            <Label>Email</Label>
            <Input defaultValue="john@example.com" className="mt-1.5 glass" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input defaultValue="+1 (555) 123-4567" className="mt-1.5 glass" />
          </div>
          <div>
            <Label>Location</Label>
            <Input defaultValue="San Francisco, CA" className="mt-1.5 glass" />
          </div>
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea defaultValue="Passionate full-stack developer with 5+ years of experience building scalable web applications." className="mt-1.5 glass" rows={3} />
        </div>
      </div>

      {/* Resume */}
      <div className="glass rounded-2xl p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <h3 className="font-display font-semibold text-lg mb-4">Resume</h3>
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-2">Drop your resume here or click to upload</p>
          <Button variant="outline" size="sm">Choose File</Button>
        </div>
      </div>

      {/* Skills */}
      <div className="glass rounded-2xl p-6 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <h3 className="font-display font-semibold text-lg mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map(s => (
            <Badge key={s} variant="outline" className="px-3 py-1.5 bg-primary/5 border-primary/20 text-primary">{s}</Badge>
          ))}
        </div>
      </div>

      <Button className="glow-primary-sm" onClick={() => toast.success("Profile saved!")}>Save Changes</Button>
    </div>
  );
}
