import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  FileText,
  ExternalLink,
  Target,
  BrainCircuit,
  AlertCircle,
  Code2,
  MessageSquare,
  FileSearch,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/api/api";
import { toast } from "sonner";

interface CandidateProfile {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  resume?: string;

  screening?: {
    atsScore?: number;
  };

  assessmentScore?: number;
  interviewScore?: number;

  status?: string;
}

export default function CandidateProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const application = location.state?.application;

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
    <div className="">
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
            <p className="text-sm text-muted-foreground mt-1">
              {candidate.email}
            </p>
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

      {/* Application Context (if navigated from Job Detail) */}
      {application && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Application Details
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="font-semibold">{application.status}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">ATS Score</p>
              <p className={`font-semibold ${(application.screening?.atsScore || 0) >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {application.screening?.atsScore ?? "—"}%
              </p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Applied On</p>
              <p className="font-semibold">{new Date(application.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {application.screening?.reasoningForHR && (
            <div className="mb-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <BrainCircuit className="h-4 w-4 text-primary" /> AI Screening Analysis
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {application.screening.reasoningForHR}
              </p>
            </div>
          )}

          {application.screening?.missingMandatorySkills?.length > 0 && (
            <div className="mb-6 bg-destructive/5 border border-destructive/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-destructive">
                <AlertCircle className="h-4 w-4" /> Missing Mandatory Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {application.screening.missingMandatorySkills.map((skill: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/30 rounded-xl p-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Code2 className="h-4 w-4 text-primary" /> Assessments
              </h4>
              {(!application.assessment && !application.assessments) || (application.assessment || application.assessments).length === 0 ? (
                <p className="text-xs text-muted-foreground">No assessments completed.</p>
              ) : (
                <div className="space-y-3">
                  {(application.assessment || application.assessments).map((a: any, i: number) => (
                    <div key={i} className="flex flex-col border-b border-border/30 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground font-medium">{a.testType || a.test_type || `Assessment ${i + 1}`}</span>
                        <span className={`font-semibold ${a.score >= 70 ? 'text-emerald-500' : (a.score != null ? 'text-amber-500' : 'text-muted-foreground')}`}>
                          {a.score != null ? `${a.score}%` : "Pending"}
                        </span>
                      </div>
                      {(a.coveredTopics || a.focus_topics) && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          <span className="font-semibold text-foreground/70">Topics:</span> {Array.isArray(a.coveredTopics || a.focus_topics) ? (a.coveredTopics || a.focus_topics).join(", ") : (a.coveredTopics || a.focus_topics)}
                        </p>
                      )}
                      {(a.suggestedDurationMinutes || a.suggested_duration_minutes) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className="font-semibold text-foreground/70">Duration:</span> {a.suggestedDurationMinutes || a.suggested_duration_minutes} mins
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-muted/30 rounded-xl p-4">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-primary" /> Interviews
              </h4>
              {!application.interviews || application.interviews.length === 0 ? (
                <p className="text-xs text-muted-foreground">No interviews scheduled/completed.</p>
              ) : (
                <div className="space-y-3">
                  {application.interviews.map((int: any, i: number) => (
                    <div key={i} className="flex flex-col border-b border-border/30 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground font-medium">{int.interview_round || `Round ${i + 1}`}</span>
                        <span className={`font-semibold ${int.score >= 70 ? 'text-emerald-500' : (int.score != null ? 'text-amber-500' : 'text-muted-foreground')}`}>
                          {int.score != null ? `${int.score}%` : "Pending"}
                        </span>
                      </div>
                      {(int.focus_topics || int.coveredTopics) && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          <span className="font-semibold text-foreground/70">Topics:</span> {Array.isArray(int.focus_topics || int.coveredTopics) ? (int.focus_topics || int.coveredTopics).join(", ") : (int.focus_topics || int.coveredTopics)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Resume */}
      {(application?.resumeUrl || candidate.resume) && (
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
      )}

      <Button
        onClick={() => {
          if (!candidate?.email) {
            toast.error("Email not available");
            return;
          }
          window.open(
            `https://mail.google.com/mail/?view=cm&fs=1&to=${candidate.email}`,
            "_blank",
          );
        }}
        className="flex-1"
      >
        Send Email
      </Button>
    </div>
  );
}
