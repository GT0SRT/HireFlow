import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Briefcase, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

import api from "@/api/api";
import ApplicationFormModal from "@/components/candidate/ApplicationFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type JobDescription = {
  job_summary?: string;
  experience_years?: string;
  mandatory_technical_skills?: string[];
  key_responsibilities?: string[];
  requirements?: string[];
  assessment_plan?: {
    test_type: string;
    focus_topics: string[];
    suggested_duration_minutes: number;
  }[];
  interview_plan?: {
    interview_round: string;
    focus_topics: string[];
  }[];
  test_description?: string;
};

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  job_description?: JobDescription;
};

export default function CandidateJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) {
      navigate("/jobs", { replace: true });
      return;
    }

    api
      .get(`/jobs/${id}`)
      .then(({ data }) => setJob(data))
      .catch(() => {
        toast.error("Failed to load job details");
        navigate("/jobs");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!job) return null;

  const assessmentPlan = job.job_description?.assessment_plan || [];
  const interviewPlan = job.job_description?.interview_plan || [];

  return (
    <div className="max-w-4xl mx-auto px-4 text-left pt-5 pb-12">
      {user?.role === "candidate" && (
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/jobs"))}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Job Board
        </button>
      )}

      <div className="glass rounded-2xl p-6 md:p-8 mb-8 animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -z-10" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">
                {job.title}
              </h1>
              {!job.isActive && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  Applications Closed
                </Badge>
              )}
            </div>
            <p className="text-sm md:text-lg text-muted-foreground">{job.company}</p>
          </div>

          <Button
            size="lg"
            className={job.isActive ? "glow-primary shrink-0" : "shrink-0 opacity-50 cursor-not-allowed"}
            disabled={!job.isActive}
            onClick={() => {
              if (!user) return navigate('/login');
              setIsModalOpen(true);
            }}
          >
            {job.isActive ? "Apply for this role" : "Applications Closed"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-border/50 pt-6">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            {job.location}
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-primary" />
            {job.type}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {job.job_description?.job_summary && (
          <section className="glass rounded-2xl p-4 md:p-8">
            <h3 className="text-lg md:text-xl font-bold mb-3 font-display">About the Role</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {job.job_description.job_summary}
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {job.job_description?.experience_years && (
            <section className="glass rounded-2xl p-8">
              <h3 className="text-lg font-bold mb-3 font-display">Experience Required</h3>
              <p className="text-muted-foreground font-medium">
                {job.job_description.experience_years}
              </p>
            </section>
          )}

          {job.job_description?.mandatory_technical_skills &&
            job.job_description.mandatory_technical_skills.length > 0 && (
              <section className="glass rounded-2xl p-4 md:p-8">
                <h3 className="text-lg md:text-xl font-bold mb-3 font-display">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.job_description.mandatory_technical_skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="default"
                      className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-sm"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
        </div>

        {job.job_description?.key_responsibilities &&
          job.job_description.key_responsibilities.length > 0 && (
            <section className="glass rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-4 font-display">Key Responsibilities</h3>
              <ul className="space-y-3">
                {job.job_description.key_responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="leading-relaxed">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

        {job.job_description?.test_description && (
            <section className="glass rounded-2xl p-4 md:p-8">
          <h3 className="text-lg md:text-xl font-bold mb-3 font-display">What to Expect</h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5 whitespace-pre-wrap">
            {job.job_description?.test_description}
          </p>

            <div className="grid gap-4">
              {assessmentPlan.length > 0 && (
                <div className="rounded-xl border border-border/60 bg-background/40 p-3 md:p-4">
                  <p className="font-medium mb-2">Assessment stage</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {assessmentPlan.map((step, index) => (
                      <li key={`${step.test_type}-${index}`}>
                        {step.test_type}
                        {step.suggested_duration_minutes
                          ? ` • about ${step.suggested_duration_minutes} minutes`
                          : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {interviewPlan.length > 0 && (
                <div className="rounded-xl border border-border/60 bg-background/40 p-3 md:p-4">
                  <p className="font-medium mb-2">Interview stage</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {interviewPlan.map((step, index) => (
                      <li key={`${step.interview_round}-${index}`}>{step.interview_round}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {job.job_description?.requirements && job.job_description.requirements.length > 0 && (
          <section className="glass rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 font-display">Additional Requirements</h3>
            <ul className="space-y-3">
              {job.job_description.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="leading-relaxed">{requirement}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <ApplicationFormModal open={isModalOpen} job={job} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}