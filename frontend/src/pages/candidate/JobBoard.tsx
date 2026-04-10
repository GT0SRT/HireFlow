import { Briefcase, MapPin, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ApplicationFormModal from "@/components/candidate/ApplicationFormModal";
import { useEffect, useState } from "react";
import api from "@/api/api";
import { toast } from "sonner";

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: { min: number; max: number };
  skills: string[];
  createdAt: string;
};

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    api
      .get("/jobs")
      .then(({ data }) => setJobs(data))
      .catch(() => toast.error("Failed to load jobs"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Job Board</h1>
        <p className="text-muted-foreground mt-1">
          Browse and apply to open positions
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.map((job, i) => (
          <div
            key={job._id}
            className="glass rounded-2xl p-6 glass-hover animate-fade-in flex flex-col"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {job.type}
              </Badge>
            </div>

            <h3 className="font-display font-semibold text-lg mb-1">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">{job.company}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="text-xs bg-primary/5 border-primary/20 text-primary"
                >
                  {s}
                </Badge>
              ))}
            </div>

            <div className="mt-auto space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {job.location}
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5" /> ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>

            <Button
              className="mt-5 w-full glow-primary-sm"
              onClick={() => handleApplyClick(job)}
            >
              Apply Now
            </Button>
          </div>
        ))}
      </div>

      {/* Modal Component */}
      <ApplicationFormModal
        open={isModalOpen}
        job={selectedJob}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
