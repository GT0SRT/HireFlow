import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp,
  ClipboardCheck, Video, FileCheck, Users, Download, Award
} from "lucide-react";

interface AssessmentStep {
  title: string;
  score?: number;
  status: "completed" | "pending" | "locked";
  type: "mcq" | "coding";
}

interface InterviewStep {
  title: string;
  score?: number;
  status: "completed" | "scheduled" | "pending" | "locked";
  type: "ai" | "human";
  date?: string;
}

interface Application {
  id: number;
  title: string;
  company: string;
  appliedDate: string;
  overallStatus: string;
  progress: number;
  assessments: AssessmentStep[];
  interviews: InterviewStep[];
  docsVerified: boolean;
  docsRequired: string[];
  docsSubmitted: string[];
  teamAllocated?: string;
  offerAvailable: boolean;
}

const applications: Application[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp",
    appliedDate: "Feb 20, 2026",
    overallStatus: "interview-scheduled",
    progress: 55,
    assessments: [
      { title: "JavaScript Fundamentals", score: 88, status: "completed", type: "mcq" },
      { title: "React Coding Challenge", score: 92, status: "completed", type: "coding" },
    ],
    interviews: [
      { title: "AI Screening Round", score: 85, status: "completed", type: "ai", date: "Feb 22, 2026" },
      { title: "Technical Round 1", status: "scheduled", type: "human", date: "Mar 01, 2026" },
      { title: "HR Interview", status: "locked", type: "human" },
    ],
    docsVerified: false,
    docsRequired: ["Aadhaar Card", "PAN Card", "Degree Certificate"],
    docsSubmitted: [],
    offerAvailable: false,
  },
  {
    id: 2,
    title: "ML Engineer",
    company: "DataFlow AI",
    appliedDate: "Feb 18, 2026",
    overallStatus: "assessment-pending",
    progress: 20,
    assessments: [
      { title: "Python Basics", score: 76, status: "completed", type: "mcq" },
      { title: "ML Coding Challenge", status: "pending", type: "coding" },
    ],
    interviews: [
      { title: "AI Technical Screen", status: "locked", type: "ai" },
    ],
    docsVerified: false,
    docsRequired: ["PAN Card", "Degree Certificate"],
    docsSubmitted: [],
    offerAvailable: false,
  },
  {
    id: 3,
    title: "Product Designer",
    company: "DesignHub",
    appliedDate: "Feb 15, 2026",
    overallStatus: "offered",
    progress: 100,
    assessments: [
      { title: "Design Principles", score: 94, status: "completed", type: "mcq" },
      { title: "Portfolio Review", score: 90, status: "completed", type: "mcq" },
    ],
    interviews: [
      { title: "AI Screening", score: 92, status: "completed", type: "ai", date: "Feb 17, 2026" },
      { title: "Design Lead Interview", score: 88, status: "completed", type: "human", date: "Feb 19, 2026" },
    ],
    docsVerified: true,
    docsRequired: ["Aadhaar Card", "Degree Certificate", "Experience Letter"],
    docsSubmitted: ["Aadhaar Card", "Degree Certificate", "Experience Letter"],
    teamAllocated: "Design",
    offerAvailable: true,
  },
  {
    id: 4,
    title: "Backend Engineer",
    company: "CloudScale",
    appliedDate: "Feb 12, 2026",
    overallStatus: "under-review",
    progress: 40,
    assessments: [
      { title: "Go Fundamentals", score: 80, status: "completed", type: "mcq" },
      { title: "System Design Quiz", score: 70, status: "completed", type: "mcq" },
    ],
    interviews: [
      { title: "AI Technical Screen", status: "pending", type: "ai" },
      { title: "Hiring Manager Round", status: "locked", type: "human" },
    ],
    docsVerified: false,
    docsRequired: ["PAN Card", "Degree Certificate"],
    docsSubmitted: [],
    offerAvailable: false,
  },
];

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  "assessment-pending": { icon: Clock, color: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Assessment Pending" },
  "interview-scheduled": { icon: AlertCircle, color: "bg-primary/10 text-primary border-primary/20", label: "Interview Scheduled" },
  "under-review": { icon: Clock, color: "bg-muted text-muted-foreground border-border", label: "Under Review" },
  "offered": { icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Offered" },
};

const stepStatusStyle: Record<string, string> = {
  completed: "text-emerald-500",
  pending: "text-amber-500",
  scheduled: "text-primary",
  locked: "text-muted-foreground opacity-50",
};

export default function MyApplications() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleExpand = (id: number) => setExpanded(prev => (prev === id ? null : id));

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Track your application progress</p>
      </div>
      <div className="space-y-4">
        {applications.map((app, i) => {
          const st = statusConfig[app.overallStatus];
          const isOpen = expanded === app.id;
          return (
            <div key={app.id} className="glass rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              {/* Header - clickable */}
              <button
                onClick={() => toggleExpand(app.id)}
                className="w-full text-left p-4 md:p-6 flex items-center gap-4 md:gap-6 glass-hover transition-colors"
              >
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-base md:text-lg">{app.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{app.company} · Applied {app.appliedDate}</p>
                  <div className="mt-2">
                    <Progress value={app.progress} className="h-1.5 md:h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{app.progress}% complete</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  <Badge variant="outline" className={`hidden sm:inline-flex gap-1.5 ${st.color}`}>
                    <st.icon className="h-3.5 w-3.5" />
                    {st.label}
                  </Badge>
                  {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </div>
              </button>

              {/* Mobile status badge */}
              <div className="sm:hidden px-4 pb-2 -mt-2">
                <Badge variant="outline" className={`gap-1.5 ${st.color}`}>
                  <st.icon className="h-3.5 w-3.5" />
                  {st.label}
                </Badge>
              </div>

              {/* Expanded Content */}
              {isOpen && (
                <div className="border-t border-border/50 p-4 md:p-6 space-y-6 animate-fade-in">

                  {/* Assessments */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                      <h4 className="font-display font-semibold text-sm md:text-base">Assessments</h4>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      {app.assessments.map((a, j) => (
                        <div key={j} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-muted/30">
                          <div className={`shrink-0 ${stepStatusStyle[a.status]}`}>
                            {a.status === "completed" ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> : <Clock className="h-4 w-4 md:h-5 md:w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{a.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{a.type === "coding" ? "Coding Challenge" : "MCQ"}</p>
                          </div>
                          <div className="text-right shrink-0">
                            {a.score != null ? (
                              <span className={`font-display font-bold text-sm ${a.score >= 70 ? "text-emerald-500" : "text-destructive"}`}>{a.score}%</span>
                            ) : (
                              <Badge variant="secondary" className="text-xs capitalize">{a.status}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interviews */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="h-4 w-4 text-primary" />
                      <h4 className="font-display font-semibold text-sm md:text-base">Interviews</h4>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      {app.interviews.map((iv, j) => (
                        <div key={j} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-muted/30 ${iv.status === "locked" ? "opacity-50" : ""}`}>
                          <div className={`shrink-0 ${stepStatusStyle[iv.status]}`}>
                            {iv.status === "completed" ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> :
                             iv.status === "scheduled" ? <AlertCircle className="h-4 w-4 md:h-5 md:w-5" /> :
                             <Clock className="h-4 w-4 md:h-5 md:w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{iv.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {iv.type === "ai" ? "AI Interview" : "Human Interview"}
                              {iv.date && ` · ${iv.date}`}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            {iv.score != null ? (
                              <span className={`font-display font-bold text-sm ${iv.score >= 70 ? "text-emerald-500" : "text-destructive"}`}>{iv.score}%</span>
                            ) : (
                              <Badge variant="secondary" className="text-xs capitalize">{iv.status}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document Verification */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileCheck className="h-4 w-4 text-primary" />
                      <h4 className="font-display font-semibold text-sm md:text-base">Document Verification</h4>
                      {app.docsVerified && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs ml-auto">Verified</Badge>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {app.docsRequired.map(doc => {
                        const submitted = app.docsSubmitted.includes(doc);
                        return (
                          <div key={doc} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                            <div className={submitted ? "text-emerald-500" : "text-muted-foreground"}>
                              {submitted ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                            </div>
                            <span className="text-sm">{doc}</span>
                            {submitted && <Badge variant="secondary" className="text-xs ml-auto">Submitted</Badge>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Team Allocation */}
                  {app.teamAllocated && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-primary" />
                        <h4 className="font-display font-semibold text-sm md:text-base">Team Allocation</h4>
                      </div>
                      <div className="p-3 md:p-4 rounded-xl bg-muted/30 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Assigned to <span className="text-primary">{app.teamAllocated}</span> team</p>
                          <p className="text-xs text-muted-foreground">You'll be onboarded after accepting the offer</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Offer Letter */}
                  {app.offerAvailable && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-3 flex-1">
                        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                        <div>
                          <p className="font-display font-semibold text-sm">Offer Letter Available! 🎉</p>
                          <p className="text-xs text-muted-foreground">Congratulations! Download and review your offer.</p>
                        </div>
                      </div>
                      <Button size="sm" className="glow-primary-sm gap-2 w-full sm:w-auto">
                        <Download className="h-4 w-4" />
                        Download Offer
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
