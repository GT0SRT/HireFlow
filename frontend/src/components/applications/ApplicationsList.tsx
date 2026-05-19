import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getApplicationsForUI } from "@/lib/mock-data-service";
import { CheckCircle2, XCircle, Clock, FileText } from "lucide-react";

interface ApplicationsListProps {
  jobId?: string;
}

export const ApplicationsList = ({ jobId }: ApplicationsListProps) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      try {
        const data = await getApplicationsForUI(jobId);
        setApplications(data);
      } catch (error) {
        console.error("Error loading applications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [jobId]);

  const statusIcon = (status: string) => {
    switch (status) {
      case "Selected":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "Interview Scheduled":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Selected":
        return "bg-emerald-100 text-emerald-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Interview Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Assessment Pending":
        return "bg-amber-100 text-amber-800";
      case "Applied":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const scoreColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 85) return "text-emerald-600 font-semibold";
    if (score >= 75) return "text-blue-600 font-semibold";
    if (score >= 65) return "text-amber-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  const filteredApplications =
    filter === "all" ? applications : applications.filter((app) => app.status === filter);

  if (loading) {
    return <div className="p-6 text-center">Loading applications...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-2 text-sm whitespace-nowrap ${
            filter === "all" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-600"
          }`}
        >
          All ({applications.length})
        </button>
        {["Applied", "Assessment Pending", "Interview Scheduled", "Selected", "Rejected"].map(
          (status) => {
            const count = applications.filter((a) => a.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-2 text-sm whitespace-nowrap ${
                  filter === status ? "border-b-2 border-blue-500 font-semibold" : "text-gray-600"
                }`}
              >
                {status} ({count})
              </button>
            );
          }
        )}
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Candidate</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-center font-semibold">Resume Score</th>
              <th className="px-4 py-3 text-center font-semibold">Assessment</th>
              <th className="px-4 py-3 text-center font-semibold">Interview</th>
              <th className="px-4 py-3 text-left font-semibold">Applied</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr key={app._id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-gray-900">{app.name}</p>
                    <p className="text-gray-600 text-xs">{app.email}</p>
                    {app.location && <p className="text-gray-500 text-xs">{app.location}</p>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${statusColor(app.status)} gap-1`}>
                    {statusIcon(app.status)}
                    {app.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  {app.screening?.atsScore !== undefined ? (
                    <div className="flex flex-col items-center">
                      <span className={scoreColor(app.screening.atsScore)}>
                        {app.screening.atsScore}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {app.screening.status === "Shortlisted" ? "✓" : "✗"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {app.assessmentScore !== undefined ? (
                    <span className={scoreColor(app.assessmentScore)}>{app.assessmentScore}%</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {app.interviewScore !== undefined ? (
                    <span className={scoreColor(app.interviewScore)}>{app.interviewScore}%</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{app.appliedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No applications found for this filter</p>
        </div>
      )}
    </div>
  );
};

export default ApplicationsList;
