import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Briefcase, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ScoreDetail {
  score: number;
  reason: string;
  strengths: string[];
  improvements: string[];
}

interface CandidateData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  experience?: number;
  skills?: string[];
  resume?: ScoreDetail;
  assessment?: ScoreDetail;
  interview?: ScoreDetail;
  status: string;
}

// Dummy candidate data with score details
const DUMMY_CANDIDATES: Record<string, CandidateData> = {
  c1: {
    _id: "c1",
    name: "Rajan Sharma",
    email: "rajan@example.com",
    phone: "+91-9876543210",
    experience: 5,
    skills: ["React", "TypeScript", "Node.js", "CSS", "REST APIs"],
    resume: {
      score: 85,
      reason: "Strong technical background with relevant skills matching job requirements",
      strengths: [
        "5+ years of frontend development experience",
        "Proficient in React and TypeScript",
        "Lead multiple projects successfully",
        "Good understanding of performance optimization",
      ],
      improvements: [
        "Limited experience with latest TypeScript features",
        "No mention of mobile development",
      ],
    },
    assessment: {
      score: 78,
      reason: "Good problem-solving skills, some optimization gaps",
      strengths: [
        "Excellent logical thinking",
        "Clear code structure",
        "Proper error handling",
      ],
      improvements: [
        "Could optimize time complexity further",
        "Missing some edge case handling",
      ],
    },
    interview: {
      score: 82,
      reason: "Communicative, confident, clear about goals",
      strengths: [
        "Excellent communication skills",
        "Clear about career goals",
        "Enthusiastic about role",
        "Good cultural fit",
      ],
      improvements: [
        "Limited discussion on past failures",
      ],
    },
    status: "Interview Scheduled",
  },
  c2: {
    _id: "c2",
    name: "Anita Verma",
    email: "anita@example.com",
    phone: "+91-9876543211",
    experience: 2,
    skills: ["React", "JavaScript", "CSS", "HTML"],
    resume: {
      score: 68,
      reason: "Decent candidate with basic skills but lacks depth in requirements",
      strengths: [
        "2+ years of React experience",
        "Good CSS knowledge",
        "Familiar with modern tooling",
      ],
      improvements: [
        "Limited TypeScript experience",
        "No backend knowledge",
        "Missing advanced React patterns",
      ],
    },
    assessment: {
      score: 62,
      reason: "Basic coding skills, needs improvement in complexity handling",
      strengths: [
        "Good fundamentals",
        "Clean code style",
      ],
      improvements: [
        "Struggled with medium complexity problem",
        "Not optimal solution approach",
        "Missing test coverage mindset",
      ],
    },
    interview: {
      score: 70,
      reason: "Polite and enthusiastic, needs more experience",
      strengths: [
        "Good attitude and enthusiasm",
        "Willing to learn",
        "Clear communication",
      ],
      improvements: [
        "Limited professional experience",
        "Not confident about system design",
      ],
    },
    status: "Applied",
  },
  c3: {
    _id: "c3",
    name: "Suresh Gupta",
    email: "suresh@example.com",
    phone: "+91-9876543212",
    experience: 7,
    skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "AWS"],
    resume: {
      score: 88,
      reason: "Excellent backend engineer with strong DevOps experience",
      strengths: [
        "7+ years backend development",
        "Strong database knowledge",
        "AWS certified",
        "Experience with microservices",
      ],
      improvements: [
        "Limited frontend knowledge",
      ],
    },
    assessment: {
      score: 84,
      reason: "Strong algorithmic skills and system design thinking",
      strengths: [
        "Excellent problem-solving",
        "Optimal solutions",
        "Good code quality",
        "Proper documentation",
      ],
      improvements: [],
    },
    interview: {
      score: 86,
      reason: "Very confident, clear articulation, strong technical depth",
      strengths: [
        "Excellent technical depth",
        "Clear communication",
        "Good system design understanding",
        "Leadership qualities",
      ],
      improvements: [],
    },
    status: "Assessment Pending",
  },
  c4: {
    _id: "c4",
    name: "Neha Patel",
    email: "neha@example.com",
    phone: "+91-9876543213",
    experience: 1,
    skills: ["Manual Testing", "Basic Automation", "QA"],
    resume: {
      score: 45,
      reason: "Minimal experience and skills for QA role",
      strengths: [
        "Basic QA knowledge",
      ],
      improvements: [
        "Only 1 year of experience",
        "Limited automation knowledge",
        "No exposure to CI/CD",
        "No performance testing experience",
      ],
    },
    assessment: {
      score: 38,
      reason: "Struggled significantly with test scenario design",
      strengths: [
        "Good attention to detail",
      ],
      improvements: [
        "Weak logical thinking",
        "Poor test case design",
        "Limited automation scripting",
      ],
    },
    interview: {
      score: 42,
      reason: "Not ready for this role level",
      strengths: [
        "Positive attitude",
      ],
      improvements: [
        "Lacks confidence",
        "Limited domain knowledge",
        "Poor articulation",
      ],
    },
    status: "Rejected",
  },
  c5: {
    _id: "c5",
    name: "Vikram Singh",
    email: "vikram@example.com",
    phone: "+91-9876543214",
    experience: 8,
    skills: ["QA Automation", "Selenium", "Python", "TestNG", "CI/CD"],
    resume: {
      score: 92,
      reason: "Perfect fit with extensive QA automation experience",
      strengths: [
        "8+ years QA experience",
        "Strong automation background",
        "Python & Selenium expertise",
        "CI/CD pipeline knowledge",
        "Performance testing experience",
      ],
      improvements: [],
    },
    assessment: {
      score: 90,
      reason: "Exceptional test design and automation skills",
      strengths: [
        "Excellent test scenario design",
        "Optimal automation approach",
        "Good code quality",
        "Proper documentation",
      ],
      improvements: [],
    },
    interview: {
      score: 95,
      reason: "Outstanding candidate, ready for leadership",
      strengths: [
        "Exceptional communication",
        "Strong technical expertise",
        "Leadership qualities",
        "Great cultural fit",
        "Clear vision for QA strategy",
      ],
      improvements: [],
    },
    status: "Selected",
  },
};

function ScoreCard({ title, detail }: { title: string; detail: ScoreDetail }) {
  const scoreColor =
    detail.score >= 80 ? "text-emerald-500" : detail.score >= 60 ? "text-amber-500" : "text-destructive";

  return (
    <div className="glass rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <span className={`text-2xl font-bold ${scoreColor}`}>{detail.score}%</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{detail.reason}</p>

      {detail.strengths.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-emerald-500 mb-1">Strengths:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {detail.strengths.map((s, i) => (
              <li key={i} className="ml-2">
                ✓ {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail.improvements.length > 0 && (
        <div>
          <p className="text-xs font-medium text-amber-500 mb-1">Areas for Improvement:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {detail.improvements.map((imp, i) => (
              <li key={i} className="ml-2">
                • {imp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function CandidateDetail() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;

    setTimeout(() => {
      if (DUMMY_CANDIDATES[candidateId]) {
        setCandidate(DUMMY_CANDIDATES[candidateId]);
      }
      setLoading(false);
    }, 300);
  }, [candidateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Candidate not found.</p>
      </div>
    );
  }

  const avgScore = candidate.resume && candidate.assessment && candidate.interview
    ? Math.round((candidate.resume.score + candidate.assessment.score + candidate.interview.score) / 3)
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/hr/jobs"))}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">{candidate.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {candidate.experience} years experience · {candidate.skills?.join(", ")}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              className={
                candidate.status === "Selected"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : candidate.status === "Rejected"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }
            >
              {candidate.status}
            </Badge>
            <div className="text-right">
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Star className="h-5 w-5 text-amber-500" />
                {avgScore}%
              </div>
              <p className="text-xs text-muted-foreground">Overall Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <a href={`mailto:${candidate.email}`} className="font-medium hover:text-primary transition-colors">
              {candidate.email}
            </a>
          </div>
        </div>

        {candidate.phone && (
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <a href={`tel:${candidate.phone}`} className="font-medium hover:text-primary transition-colors">
                {candidate.phone}
              </a>
            </div>
          </div>
        )}

        {candidate.experience !== undefined && (
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="font-medium">{candidate.experience}+ years</p>
            </div>
          </div>
        )}
      </div>

      {/* Score Details */}
      {candidate.resume && (
        <ScoreCard title="Resume Score - AI Evaluation" detail={candidate.resume} />
      )}
      {candidate.assessment && (
        <ScoreCard title="Assessment Score - Coding Challenge" detail={candidate.assessment} />
      )}
      {candidate.interview && (
        <ScoreCard title="Interview Score - HR & Technical" detail={candidate.interview} />
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8">
        <Button
          onClick={() => window.open(`mailto:${candidate.email}`)}
          className="flex-1"
        >
          Send Email
        </Button>
        <Button
          variant="outline"
          onClick={() => window.open(`tel:${candidate.phone}`)}
          disabled={!candidate.phone}
        >
          Call
        </Button>
      </div>
    </div>
  );
}
