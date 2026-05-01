export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  skills: string[];
  posted: string;
}

export const candidateJobs: Job[] = [
  { id: 1, title: "Senior Frontend Developer", company: "TechCorp", location: "Remote", type: "Full-time", salary: "$120k-$160k", skills: ["React", "TypeScript", "Tailwind"], posted: "2 days ago" },
  { id: 2, title: "ML Engineer", company: "DataFlow AI", location: "San Francisco, CA", type: "Full-time", salary: "$140k-$180k", skills: ["Python", "PyTorch", "MLOps"], posted: "1 day ago" },
  { id: 3, title: "Product Designer", company: "DesignHub", location: "Remote", type: "Contract", salary: "$90k-$120k", skills: ["Figma", "UX Research", "Prototyping"], posted: "5 days ago" },
  { id: 4, title: "Backend Engineer", company: "CloudScale", location: "New York, NY", type: "Full-time", salary: "$130k-$170k", skills: ["Go", "PostgreSQL", "K8s"], posted: "3 days ago" },
  { id: 5, title: "DevOps Engineer", company: "InfraCore", location: "Remote", type: "Full-time", salary: "$110k-$150k", skills: ["AWS", "Terraform", "Docker"], posted: "1 week ago" },
  { id: 6, title: "Data Analyst", company: "InsightCo", location: "Austin, TX", type: "Full-time", salary: "$80k-$110k", skills: ["SQL", "Python", "Tableau"], posted: "4 days ago" },
];

export interface AssessmentStep {
  title: string;
  score?: number;
  status: "completed" | "pending" | "locked";
  type: "mcq" | "coding";
}

export interface InterviewStep {
  title: string;
  score?: number;
  status: "completed" | "scheduled" | "pending" | "locked";
  type: "ai" | "human";
  date?: string;
}

export interface Application {
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

export const myApplicationsData: Application[] = [
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

export interface RecentJob {
  id: number;
  title: string;
  applicants: number;
  status: "Active" | "Closed";
  posted: string;
}

export const hrRecentJobs: RecentJob[] = [
  { id: 1, title: "Senior Frontend Developer", applicants: 45, status: "Active", posted: "2 days ago" },
  { id: 2, title: "ML Engineer", applicants: 32, status: "Active", posted: "3 days ago" },
  { id: 3, title: "Product Designer", applicants: 28, status: "Closed", posted: "1 week ago" },
  { id: 4, title: "Backend Engineer", applicants: 56, status: "Active", posted: "5 days ago" },
];

export type CandidateStatus = "applied" | "assessment" | "interview" | "offer" | "hired" | "rejected";

export interface Candidate {
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

export const hrJobDetailData = {
  id: 1,
  title: "Senior Frontend Developer",
  posted: "Feb 20, 2026",
  deadline: "Mar 15, 2026",
  status: "Active",
  totalApplicants: 45,
  team: "Engineering",
};

export const hrCandidatesData: Candidate[] = [
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
