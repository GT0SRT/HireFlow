import { Briefcase, MapPin, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ApplicationFormModal from "@/components/candidate/ApplicationFormModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import api from "@/api/api";
import { toast } from "sonner";

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  job_description?: {
    job_summary?: string;
    experience_years?: string;
    mandatory_technical_skills?: string[];
    key_responsibilities?: string[];
    requirements?: string[];
    assessment_plan?: { test_type: string; focus_topics: string[]; suggested_duration_minutes: number }[];
    interview_plan?: { interview_round: string; focus_topics: string[] }[];
  };
  createdAt: string;
};

export default function JobBoard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();

  // Filters & Pagination UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [limit, setLimit] = useState("10");

  useEffect(() => {
    api
      .get("/jobs")
      .then(({ data }) => setJobs(data.jobs || []))
      .catch(() => toast.error("Failed to load jobs"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user || user.role !== "candidate") {
      setAppliedJobIds(new Set());
      return;
    }

    api
      .get("/applications/my")
      .then(({ data }) => {
        const ids = new Set<string>();

        (data || []).forEach((application: { job?: string | { _id?: string } }) => {
          if (typeof application.job === "string") {
            ids.add(application.job);
            return;
          }

          if (application.job?._id) {
            ids.add(application.job._id);
          }
        });

        setAppliedJobIds(ids);
      })
      .catch(() => setAppliedJobIds(new Set()));
  }, [user]);

  const visibleJobs = jobs.filter((job) => !appliedJobIds.has(job._id));

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );

  const handleApplyClick = (job: Job) => {
    if (!user) return navigate('/login');
    setSelectedJob(job);
    setIsModalOpen(true);
  };
  
  const handleViewDetails = (job: Job) => navigate(`/jobs/${job._id}`);

  return (
    <div className="flex flex-col min-h-[96vh]">
      <div className="mb-8 mt-16 md:mt-3">
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Job Board</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Browse and apply to open positions
        </p>
      </div>
      
      {/* Search and Filters (UI Only) */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs by title, skill, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 glass"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:shrink-0">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full md:w-[140px] glass">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[140px] glass">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex mb-3 mr-3 flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <span className="ml-auto">Show</span>
          <Select value={limit} onValueChange={setLimit}>
          <SelectTrigger className="h-8 w-[70px] bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
          </Select>
        <span>jobs per page</span>
      </div>

      {visibleJobs.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No open jobs left to apply for right now.</p>
          {jobs.length > 0 && appliedJobIds.size > 0 && (
            <p className="mt-2 text-sm">You have already applied to the jobs that are currently listed here.</p>
          )}
        </div>
      ) : (
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {visibleJobs.map((job, i) => (
          <div
            key={job._id}
            className="glass rounded-2xl p-4 sm:p-6 glass-hover animate-fade-in flex flex-col cursor-pointer transition-transform hover:-translate-y-1"
            onClick={() => handleViewDetails(job)}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {job.type}
              </Badge>
            </div>

            <h3 className="font-display font-semibold text-base sm:text-lg mb-1 leading-snug">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 truncate">{job.company}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {(job.job_description?.mandatory_technical_skills || []).slice(0, 4).map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="text-xs bg-primary/5 border-primary/20 text-primary"
                >
                  {s}
                </Badge>
              ))}
            </div>

            <div className="mt-auto space-y-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {job.location}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>

            <Button
              className="mt-5 w-full glow-primary-sm text-sm sm:text-base"
              onClick={(e) => {
                e.stopPropagation();
                handleApplyClick(job);
              }}
            >
              Apply Now
            </Button>
          </div>
        ))}
      </div>
      )}
      
      {/* Pagination (UI Only) */}
      {visibleJobs.length > 0 && (
        <div className="mt-auto md:mt-10 p-4 glass rounded-xl">
          <div className="grid w-full grid-cols-3 items-center">
            <Button variant="outline" size="sm" disabled className="h-8 col-span-1 w-fit bg-background/50 text-xs sm:text-sm">
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <div className="text-xs text-center col-span-1 sm:text-sm font-medium px-2">Page 1</div>
            <Button variant="outline" size="sm" className="h-8 col-span-1 w-fit ml-auto bg-background/50 text-xs sm:text-sm">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Component */}
      <ApplicationFormModal
        open={isModalOpen}
        job={selectedJob}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
