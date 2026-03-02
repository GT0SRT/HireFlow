import { Briefcase, MapPin, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import ApplicationFormModal from "@/components/candidate/ApplicationFormModal";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  skills: string[];
  posted: string;
};

const jobs: Job[] = [
  { id: 1, title: "Senior Frontend Developer", company: "TechCorp", location: "Remote", type: "Full-time", salary: "$120k-$160k", skills: ["React", "TypeScript", "Tailwind"], posted: "2 days ago" },
  { id: 2, title: "ML Engineer", company: "DataFlow AI", location: "San Francisco, CA", type: "Full-time", salary: "$140k-$180k", skills: ["Python", "PyTorch", "MLOps"], posted: "1 day ago" },
  { id: 3, title: "Product Designer", company: "DesignHub", location: "Remote", type: "Contract", salary: "$90k-$120k", skills: ["Figma", "UX Research", "Prototyping"], posted: "5 days ago" },
  { id: 4, title: "Backend Engineer", company: "CloudScale", location: "New York, NY", type: "Full-time", salary: "$130k-$170k", skills: ["Go", "PostgreSQL", "K8s"], posted: "3 days ago" },
  { id: 5, title: "DevOps Engineer", company: "InfraCore", location: "Remote", type: "Full-time", salary: "$110k-$150k", skills: ["AWS", "Terraform", "Docker"], posted: "1 week ago" },
  { id: 6, title: "Data Analyst", company: "InsightCo", location: "Austin, TX", type: "Full-time", salary: "$80k-$110k", skills: ["SQL", "Python", "Tableau"], posted: "4 days ago" },
];

export default function JobBoard() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Job Board</h1>
        <p className="text-muted-foreground mt-1">Browse and apply to open positions</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.map((job, i) => (
          <div
            key={job.id}
            className="glass rounded-2xl p-6 glass-hover animate-fade-in flex flex-col"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">{job.type}</Badge>
            </div>

            <h3 className="font-display font-semibold text-lg mb-1">{job.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{job.company}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.map(s => (
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
                <DollarSign className="h-3.5 w-3.5" /> {job.salary}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> {job.posted}
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
