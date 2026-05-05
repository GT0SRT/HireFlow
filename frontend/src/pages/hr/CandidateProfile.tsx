import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, MapPin, Phone, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/api/api";
import { toast } from "sonner";

interface CandidateProfile {
  _id: string;
  name: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  resume?: string;
}

export default function CandidateProfile() {
  const { userId } = useParams();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/profile/${userId}`)
      .then(({ data }) => setCandidate(data))
      .catch(() => toast.error("Failed to load candidate profile"))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!candidate) return (
    <div className="text-center py-16 text-muted-foreground">Profile not found</div>
  );

  return (
    <div className="max-w-2xl">
      <Link
        to={-1 as any}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">{candidate.name}</h1>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
              {candidate.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {candidate.location}
                </span>
              )}
              {candidate.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {candidate.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {candidate.bio && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-display font-semibold mb-2">About</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{candidate.bio}</p>
        </div>
      )}

      {/* Skills */}
      {candidate.skills && candidate.skills.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-display font-semibold mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map(s => (
              <Badge key={s} variant="outline" className="bg-primary/5 border-primary/20 text-primary px-3 py-1">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Resume */}
      {candidate.resume && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-display font-semibold mb-3">Resume</h3>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Resume available</p>
              <p className="text-xs text-muted-foreground">{candidate.resume.split("/").pop()}</p>
            </div>
            <a href={candidate.resume} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-3.5 w-3.5" />
                View Resume
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}