import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { interviewAPI} from "@/lib/interview-api";
import type { Interview } from "@/lib/interview-api";

export default function InterviewResult() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterview();
  }, [interviewId]);

  const loadInterview = async () => {
    if (!interviewId) return;

    try {
      const data = await interviewAPI.getDetails(interviewId);
      setInterview(data);
    } catch (error: any) {
      toast.error("Failed to load results");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!interview || !interview.analysis) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No analysis available</p>
      </div>
    );
  }

  const { analysis } = interview;
  const scoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-500";
    if (score >= 6) return "text-amber-500";
    return "text-destructive";
  };

  const recommendationColor = {
    strong_yes: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    yes: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    maybe: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    no: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Overall Score */}
        <div className="glass rounded-2xl p-8 mb-6 text-center">
          <h1 className="text-3xl font-display font-bold mb-2">Interview Complete!</h1>
          <p className="text-muted-foreground mb-6">{interview.company} - {interview.role_name}</p>
          
          <div className="inline-flex items-center justify-center h-32 w-32 rounded-full bg-primary/10 mb-4">
            <span className={`text-5xl font-bold ${scoreColor(analysis.overall_score)}`}>
              {analysis.overall_score.toFixed(1)}
            </span>
          </div>
          
          <Badge className={recommendationColor[analysis.recommendation as keyof typeof recommendationColor]}>
            Recommendation: {analysis.recommendation.replace("_", " ").toUpperCase()}
          </Badge>
        </div>

        {/* Metrics */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4">Performance Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(analysis.metrics).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm capitalize">{key.replace("_", " ")}</span>
                  <span className={`text-sm font-semibold ${scoreColor(value)}`}>
                    {value.toFixed(1)}/10
                  </span>
                </div>
                <Progress value={value * 10} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        {analysis.key_strengths.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold">Key Strengths</h3>
            </div>
            <ul className="space-y-2">
              {analysis.key_strengths.map((strength, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {analysis.areas_for_improvement.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {analysis.areas_for_improvement.map((area, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Overall Assessment */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-3">Overall Assessment</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysis.overall_assessment}
          </p>
        </div>

        {/* Reasoning */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-3">Detailed Reasoning</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {analysis.reasoning}
          </p>
        </div>
      </div>
    </div>
  );
}