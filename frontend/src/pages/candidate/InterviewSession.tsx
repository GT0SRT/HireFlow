import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Volume2, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import VoiceRecorder from "@/components/interview/VoiceRecorder";
import { interviewAPI} from "@/lib/interview-api";
import type { Interview } from "@/lib/interview-api";

export default function InterviewSession() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    startInterview();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  const startInterview = async () => {
    if (!applicationId) return;

    try {
      setLoading(true);
      const newInterview = await interviewAPI.start({
        applicationId,
        difficulty: "moderate", // Can be selected by user
      });

      setInterview(newInterview);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Greet candidate
      speakText("Hello! Welcome to your interview. Please introduce yourself briefly.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start interview");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsAISpeaking(true);
    utterance.onend = () => setIsAISpeaking(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleUserMessage = async (message: string) => {
    if (!interview) return;

    try {
      setLoading(true);

      const response = await interviewAPI.sendMessage(interview._id, {
        message,
        duration_sec: duration,
      });

      // Speak AI response
      speakText(response.reply);

      // Update interview in state
      setInterview((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          transcript: [
            ...prev.transcript,
            { speaker: "candidate", text: message, timestamp: new Date().toISOString() },
            { speaker: "interviewer", text: response.reply, timestamp: new Date().toISOString() },
          ],
        };
      });

      // Check if interview ended
      if (response.interview_ended) {
        toast.info("Interview is concluding. You can end the call now.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (!interview) return;

    try {
      setLoading(true);
      window.speechSynthesis.cancel();

      const result = await interviewAPI.complete(interview._id);

      toast.success("Interview completed! Analyzing your performance...");
      
      // Navigate to results
      navigate(`/candidate/interview-result/${interview._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to end interview");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading && !interview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Starting your interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Volume2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">{interview.role_name}</h1>
                <p className="text-sm text-muted-foreground">{interview.company}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{formatTime(duration)}</span>
              </div>
              <Badge variant={isAISpeaking ? "default" : "outline"}>
                {isAISpeaking ? "AI Speaking..." : "Your Turn"}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            {interview.topics.slice(0, 3).map((topic, i) => (
              <Badge key={i} variant="secondary">
                {topic}
              </Badge>
            ))}
            {interview.topics.length > 3 && (
              <Badge variant="secondary">+{interview.topics.length - 3} more</Badge>
            )}
          </div>
        </div>

        {/* Transcript */}
        <div className="glass rounded-2xl p-6 mb-6 max-h-[400px] overflow-y-auto">
          <h3 className="font-semibold mb-4">Interview Transcript</h3>
          <div className="space-y-4">
            {interview.transcript.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Conversation will appear here...
              </p>
            ) : (
              interview.transcript.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.speaker === "candidate" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.speaker === "candidate"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted"
                    }`}
                  >
                    {msg.speaker === "candidate" ? "You" : "AI"}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                      msg.speaker === "candidate"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Voice Recorder */}
        <div className="glass rounded-2xl p-6 mb-6">
          <VoiceRecorder
            onTranscript={handleUserMessage}
            disabled={loading}
            isAISpeaking={isAISpeaking}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!showEndConfirm ? (
            <Button
              onClick={() => setShowEndConfirm(true)}
              variant="destructive"
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              End Interview
            </Button>
          ) : (
            <>
              <Button
                onClick={handleEndInterview}
                variant="destructive"
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ending...
                  </>
                ) : (
                  "Confirm End"
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowEndConfirm(false)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}