


import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  FileText,
  ExternalLink,
} from "lucide-react";
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
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/profile/${userId}`)
      .then(({ data }) => setCandidate(data))
      .catch(() => toast.error("Failed to load candidate profile"))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleViewResume = () => {
    if (!candidate?.resume) {
      toast.error("Resume not available");
      return;
    }
    
    // Open in new tab - browser will handle display vs download
    window.open(candidate.resume, "_blank", "noopener,noreferrer");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );

  if (!candidate)
    return (
      <div className="text-center py-16 text-muted-foreground">
        Profile not found
      </div>
    );

  return (
    <div className="max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">
              {candidate.name}
            </h1>
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
          <p className="text-muted-foreground text-sm leading-relaxed">
            {candidate.bio}
          </p>
        </div>
      )}

      {/* Skills */}
      {candidate.skills && candidate.skills.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-display font-semibold mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((s, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-primary/5 border-primary/20 text-primary px-3 py-1"
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Resume */}
      {candidate.resume ? (
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-display font-semibold mb-3">Resume</h3>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Resume available</p>
              <p className="text-xs text-muted-foreground">
                Click to view or download
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleViewResume}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <FileText className="h-5 w-5" />
            <p className="text-sm">No resume uploaded yet</p>
          </div>
        </div>
      )}
    </div>
  );
}