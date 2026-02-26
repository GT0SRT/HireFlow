import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, CheckCircle2, XCircle, Clock, Star, UserCheck, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const jobData = {
  id: 1,
  title: "Senior Frontend Developer",
  posted: "Feb 20, 2026",
  deadline: "Mar 15, 2026",
  status: "Active",
  totalApplicants: 45,
  team: "Engineering",
};

type CandidateStatus = "applied" | "assessment" | "interview" | "offer" | "hired" | "rejected";

interface Candidate {
  id: number;
  name: string;
  email: string;
  status: CandidateStatus;
  score: number;
  appliedDate: string;
  assessmentScore?: number;
  interviewScore?: number;
  recommendedTeam?: string;
}

const candidates: Candidate[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", status: "hired", score: 95, appliedDate: "Feb 21", assessmentScore: 92, interviewScore: 98, recommendedTeam: "Engineering" },
  { id: 2, name: "Bob Williams", email: "bob@example.com", status: "interview", score: 88, appliedDate: "Feb 21", assessmentScore: 85, interviewScore: 91, recommendedTeam: "Engineering" },
  { id: 3, name: "Carol Davis", email: "carol@example.com", status: "offer", score: 90, appliedDate: "Feb 22", assessmentScore: 88, interviewScore: 92, recommendedTeam: "Product" },
  { id: 4, name: "David Chen", email: "david@example.com", status: "assessment", score: 72, appliedDate: "Feb 22", assessmentScore: 72 },
  { id: 5, name: "Eva Martinez", email: "eva@example.com", status: "rejected", score: 45, appliedDate: "Feb 23", assessmentScore: 40, interviewScore: 50 },
  { id: 6, name: "Frank Brown", email: "frank@example.com", status: "applied", score: 0, appliedDate: "Feb 24" },
  { id: 7, name: "Grace Lee", email: "grace@example.com", status: "interview", score: 82, appliedDate: "Feb 24", assessmentScore: 80, interviewScore: 84, recommendedTeam: "Design" },
  { id: 8, name: "Henry Wilson", email: "henry@example.com", status: "assessment", score: 68, appliedDate: "Feb 25", assessmentScore: 68 },
  { id: 9, name: "Ivy Patel", email: "ivy@example.com", status: "rejected", score: 30, appliedDate: "Feb 25", assessmentScore: 30 },
  { id: 10, name: "Jack Thompson", email: "jack@example.com", status: "hired", score: 93, appliedDate: "Feb 22", assessmentScore: 90, interviewScore: 96, recommendedTeam: "Engineering" },
];

const statusConfig: Record<CandidateStatus, { label: string; color: string; icon: typeof Clock }> = {
  applied: { label: "Applied", color: "bg-muted text-muted-foreground", icon: Clock },
  assessment: { label: "Assessment", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  interview: { label: "Interview", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Users },
  offer: { label: "Offer Sent", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Star },
  hired: { label: "Hired", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const pipelineSteps: CandidateStatus[] = ["applied", "assessment", "interview", "offer", "hired"];

function getProgress(status: CandidateStatus) {
  const idx = pipelineSteps.indexOf(status);
  if (status === "rejected") return 0;
  return idx >= 0 ? ((idx + 1) / pipelineSteps.length) * 100 : 0;
}

export default function JobDetail() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? candidates : candidates.filter(c => c.status === filter);
  const hired = candidates.filter(c => c.status === "hired");
  const rejected = candidates.filter(c => c.status === "rejected");
  const inProgress = candidates.filter(c => !["hired", "rejected"].includes(c.status));
  const recommended = candidates.filter(c => c.recommendedTeam);

  const stats = [
    { label: "Total Applicants", value: candidates.length, icon: Users },
    { label: "In Progress", value: inProgress.length, icon: Clock },
    { label: "Hired", value: hired.length, icon: CheckCircle2 },
    { label: "Rejected", value: rejected.length, icon: XCircle },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link to="/hr/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">{jobData.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Posted {jobData.posted} · Deadline {jobData.deadline} · Team: {jobData.team}
            </p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 self-start">{jobData.status}</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((s, i) => (
          <div key={s.label} className="glass rounded-2xl p-4 md:p-6 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xl md:text-2xl font-display font-bold">{s.value}</p>
            <p className="text-xs md:text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="all" className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All Candidates</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          </TabsList>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px] glass">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer Sent</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* All Candidates Tab */}
        <TabsContent value="all">
          <div className="glass rounded-2xl overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Candidate</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Assessment</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Interview</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Progress</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const cfg = statusConfig[c.status];
                    return (
                      <tr key={c.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={cfg.color}>{cfg.label}</Badge>
                        </td>
                        <td className="p-4">
                          {c.assessmentScore != null ? (
                            <span className={`font-semibold ${c.assessmentScore >= 70 ? "text-emerald-500" : "text-destructive"}`}>{c.assessmentScore}%</span>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="p-4">
                          {c.interviewScore != null ? (
                            <span className={`font-semibold ${c.interviewScore >= 70 ? "text-emerald-500" : "text-destructive"}`}>{c.interviewScore}%</span>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="p-4 min-w-[120px]">
                          <Progress value={getProgress(c.status)} className="h-2" />
                        </td>
                        <td className="p-4 text-muted-foreground">{c.appliedDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border/30">
              {filtered.map(c => {
                const cfg = statusConfig[c.status];
                return (
                  <div key={c.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                      <Badge className={cfg.color}>{cfg.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Assessment: {c.assessmentScore != null ? `${c.assessmentScore}%` : "—"}</span>
                      <span>Interview: {c.interviewScore != null ? `${c.interviewScore}%` : "—"}</span>
                    </div>
                    <Progress value={getProgress(c.status)} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Recommended Tab */}
        <TabsContent value="recommended">
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {recommended.map(c => (
              <div key={c.id} className="glass rounded-2xl p-5 md:p-6 glass-hover">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-semibold">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                  <Badge className={statusConfig[c.status].color}>{statusConfig[c.status].label}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Assessment</p>
                    <p className="font-display font-bold text-lg">{c.assessmentScore}%</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Interview</p>
                    <p className="font-display font-bold text-lg">{c.interviewScore}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm">Recommended for: <span className="font-semibold text-primary">{c.recommendedTeam}</span></span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pipelineSteps.map(step => {
              const inStep = candidates.filter(c => c.status === step);
              const cfg = statusConfig[step];
              return (
                <div key={step} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <cfg.icon className="h-4 w-4 text-primary" />
                    <h3 className="font-display font-semibold text-sm">{cfg.label}</h3>
                    <Badge variant="secondary" className="ml-auto text-xs">{inStep.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {inStep.map(c => (
                      <div key={c.id} className="rounded-xl bg-muted/50 p-3">
                        <p className="text-sm font-medium">{c.name}</p>
                        {c.score > 0 && <p className="text-xs text-muted-foreground">Score: {c.score}%</p>}
                      </div>
                    ))}
                    {inStep.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No candidates</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Rejected */}
          {rejected.length > 0 && (
            <div className="glass rounded-2xl p-4 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="h-4 w-4 text-destructive" />
                <h3 className="font-display font-semibold text-sm">Rejected</h3>
                <Badge variant="secondary" className="ml-auto text-xs">{rejected.length}</Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {rejected.map(c => (
                  <div key={c.id} className="rounded-xl bg-muted/50 p-3">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Score: {c.score}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
