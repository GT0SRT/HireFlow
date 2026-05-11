// lib/interview-api.ts
import api from "@/api/api";

// ✅ Export interface first
export interface TranscriptItem {
  speaker: "interviewer" | "candidate";
  text: string;
  timestamp: string;
}

export interface InterviewAnalysis {
  overall_score: number;
  metrics: {
    technical: number;
    behavioral: number;
    communication: number;
    problem_solving: number;
    company_knowledge: number;
  };
  topics_covered: string[];
  overall_assessment: string;
  key_strengths: string[];
  areas_for_improvement: string[];
  recommendation: "strong_yes" | "yes" | "maybe" | "no";
  reasoning: string;
}

export interface Interview {
  _id: string;
  candidate: {
    _id: string;
    name: string;
    email: string;
    skills?: string[];
  };
  job: {
    _id: string;
    title: string;
    company: string;
  };
  application?: string;
  company: string;
  role_name: string;
  topics: string[];
  difficulty: "basic" | "moderate" | "tough";
  resume_summary: string;
  transcript: TranscriptItem[];
  duration_sec: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  analysis?: InterviewAnalysis;
  scheduled_at?: string;
  completed_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StartInterviewRequest {
  applicationId: string;
  difficulty: "basic" | "moderate" | "tough";
}

export interface SendMessageRequest {
  message: string;
  duration_sec: number;
}

export interface ChatResponse {
  reply: string;
  allotted_time_sec: number;
  interview_ended: boolean;
}

export interface CompleteInterviewResponse {
  message: string;
  analysis: InterviewAnalysis;
}

// API functions
export const interviewAPI = {
  // Start new interview
  start: async (data: StartInterviewRequest): Promise<Interview> => {
    const response = await api.post("/interviews/start", data);
    return response.data.interview;
  },

  // Send chat message
  sendMessage: async (
    interviewId: string,
    data: SendMessageRequest
  ): Promise<ChatResponse> => {
    const response = await api.post(`/interviews/${interviewId}/chat`, data);
    return response.data;
  },

  // Complete interview
  complete: async (interviewId: string): Promise<CompleteInterviewResponse> => {
    const response = await api.post(`/interviews/${interviewId}/complete`);
    return response.data;
  },

  // Get my interviews
  getMyInterviews: async (): Promise<Interview[]> => {
    const response = await api.get("/interviews/my");
    return response.data;
  },

  // Get interview details
  getDetails: async (interviewId: string): Promise<Interview> => {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
  },

  // HR: Get job interviews
  getJobInterviews: async (jobId: string): Promise<Interview[]> => {
    const response = await api.get(`/interviews/job/${jobId}`);
    return response.data;
  },
};