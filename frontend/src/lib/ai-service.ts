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
