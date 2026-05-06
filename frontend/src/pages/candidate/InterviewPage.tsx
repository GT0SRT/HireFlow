import { ChevronLeft, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";

export default function InterviewPage() {
  const navigate = useNavigate();
  const { applicationId, interviewIndex } = useParams();

  return (
    <div className="max-w-4xl mx-auto pt-8 pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
        Back
      </button>

      <div className="glass rounded-2xl p-8 md:p-12 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Video className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            Interview Round {Number(interviewIndex || 0) + 1}
          </h1>
          <p className="text-muted-foreground">
            Application ID: {applicationId}
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-3">
          <p className="text-lg font-semibold text-primary">Coming Soon</p>
          <p className="text-muted-foreground">
            The interview interface is being prepared. We'll notify you when it's ready to schedule.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Button
            className="w-full"
            onClick={() => navigate("/candidate/applications")}
          >
            Back to My Applications
          </Button>
        </div>
      </div>
    </div>
  );
}
