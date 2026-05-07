import api from "@/api/api";

export interface AIGeneratedJD {
  primary_role: string;
  job_summary: string;
  experience_years: string;
  mandatory_technical_skills: string[];
  nice_to_have_skills: string[];
  soft_skills: string[];
  key_responsibilities: string[];
  requirements: string[];
  assessment_plan?: { test_type: string; focus_topics: string[]; suggested_duration_minutes: number }[];
  interview_plan?: { interview_round: string; focus_topics: string[] }[];
  test_description?: string;
}

export async function generateJobDescription(title: string, userDescription?: string): Promise<AIGeneratedJD> {
  const response = await api.post("/ai/generate-jd", {
    title,
    notes: userDescription || ""
  });
  return response.data;
}

export interface ATSResult {
  score: number;
  threshold: number;
  reasoning_for_candidate: string;
  reasoning_for_hr: string;
  missing_mandatory_skills: string[];
}

export interface ParseAndScoreResponse {
  success: boolean;
  message: string;
  data: {
    parsedResume: Record<string, unknown>;
    atsResult: ATSResult;
  };
}

export async function parseAndScoreResume(file: File, jdJson?: unknown): Promise<ParseAndScoreResponse> {
  const formData = new FormData();
  formData.append("file", file);

  if (jdJson !== undefined) {
    formData.append("jd_json", JSON.stringify(jdJson));
  }

  const response = await api.post("/ai/parse-and-score", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}
