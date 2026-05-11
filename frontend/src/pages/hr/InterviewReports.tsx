import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Award, Users, TrendingUp, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { interviewAPI } from "@/lib/interview-api";
import type { Interview } from "@/lib/interview-api";

export default function InterviewReports() {
  const { jobId } = useParams();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  useEffect(() => {
    loadInterviews();
  }, [jobId]);

  const loadInterviews = async () => {
    if (!jobId) return;

    try {
      const data = await interviewAPI.getJobInterviews(jobId);
      setInterviews(data);
    } catch (error: any) {
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-500";
    if (score >= 6) return "text-amber-500";
    return "text-destructive";
  };

  const recommendationBadge = {
    strong_yes: "bg-emerald-500/10 text-emerald-500",
    yes: "bg-blue-500/10 text-blue-500",
    maybe: "bg-amber-500/10 text-amber-500",
    no: "bg-destructive/10 text-destructive",
  };

  if (loading) {
    return <div className="flex justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Interview Reports</h1>
          <p className="text-sm text-muted-foreground">{interviews.length} completed interviews</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{interviews.length}</p>
              <p className="text-xs text-muted-foreground">Total Interviews</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">
                {interviews.filter(i => i.analysis?.recommendation === "strong_yes" || i.analysis?.recommendation === "yes").length}
              </p>
              <p className="text-xs text-muted-foreground">Recommended</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">
                {interviews.length > 0
                  ? (interviews.reduce((sum, i) => sum + (i.analysis?.overall_score || 0), 0) / interviews.length).toFixed(1)
                  : "0"}
              </p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interviews Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20">
              <th className="text-left p-4 font-medium">Candidate</th>
              <th className="text-left p-4 font-medium">Score</th>
              <th className="text-left p-4 font-medium">Recommendation</th>
              <th className="text-left p-4 font-medium">Metrics</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview) => (
              <tr key={interview._id} className="border-b border-border/30 hover:bg-muted/30">
                <td className="p-4">
                  <p className="font-medium">{interview.candidate.name}</p>
                  <p className="text-xs text-muted-foreground">{interview.candidate.email}</p>
                </td>

                <td className="p-4">
                  <span className={`text-2xl font-bold ${scoreColor(interview.analysis?.overall_score || 0)}`}>
                    {interview.analysis?.overall_score.toFixed(1) || "N/A"}
                  </span>
                </td>

                <td className="p-4">
                  <Badge className={recommendationBadge[interview.analysis?.recommendation as keyof typeof recommendationBadge]}>
                    {interview.analysis?.recommendation.replace("_", " ").toUpperCase()}
                  </Badge>
                </td>

                <td className="p-4">
                  <div className="flex gap-2 text-xs">
                    <span>Tech: {interview.analysis?.metrics.technical.toFixed(1)}</span>
                    <span>Comm: {interview.analysis?.metrics.communication.toFixed(1)}</span>
                    <span>PS: {interview.analysis?.metrics.problem_solving.toFixed(1)}</span>
                  </div>
                </td>

                <td className="p-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setSelectedInterview(interview)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {interviews.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No completed interviews yet
          </div>
        )}
      </div>

      {/* Detail Modal - Add this as a Dialog component */}
    </div>
  );
}