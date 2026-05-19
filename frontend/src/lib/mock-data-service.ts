import api from "@/api/api";

/**
 * Get applications for UI using real API endpoints.
 * If `jobId` is provided, calls HR endpoint; otherwise fetches the current user's applications.
 */
export const getApplicationsForUI = async (jobId?: string): Promise<any[]> => {
  if (jobId) {
    const res = await api.get(`/applications/job/${jobId}`);
    return res.data;
  }
  const res = await api.get(`/applications/my`);
  return res.data;
};

export const getSingleApplicationForUI = async (appId: string): Promise<any | null> => {
  // No direct GET /applications/:id endpoint exists; fetch user's apps and find the id
  try {
    const res = await api.get(`/applications/my`);
    const apps = res.data || [];
    return apps.find((a: any) => String(a._id) === String(appId)) || null;
  } catch (e) {
    return null;
  }
};

export const getApplicationStats = async (jobId?: string) => {
  const apps = await getApplicationsForUI(jobId);
  const total = apps.length || 0;
  const statusBreakdown = {
    selected: apps.filter((a: any) => a.status === "Selected").length,
    interviewed: apps.filter((a: any) => a.status === "Interview Scheduled").length,
    assessmentPending: apps.filter((a: any) => a.status === "Assessment Pending").length,
    applied: apps.filter((a: any) => a.status === "Applied").length,
    rejected: apps.filter((a: any) => a.status === "Rejected").length,
  };

  const avg = (arr: number[]) => (arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1) : "0.0");

  const scoreStats = {
    avgAtsScore: avg(apps.map((a: any) => a.screening?.atsScore || 0)),
    avgAssessmentScore: avg(apps.map((a: any) => a.assessmentScore || 0)),
    avgInterviewScore: avg(apps.map((a: any) => a.interviewScore || 0)),
  };

  return { total, statusBreakdown, scoreStats };
};
