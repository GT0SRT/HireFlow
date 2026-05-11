import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  isAISpeaking?: boolean;
}

export default function VoiceRecorder({ onTranscript, disabled, isAISpeaking }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript((prev) => prev + finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        toast.error(`Recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (isRecording) {
        recognition.start(); // Restart if still recording
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (disabled || isAISpeaking) {
      toast.error(isAISpeaking ? "Wait for interviewer to finish" : "Please wait");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSend = () => {
    if (!transcript.trim()) {
      toast.error("Please speak your answer first");
      return;
    }

    onTranscript(transcript.trim());
    setTranscript("");
    
    // Stop recording after sending
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Transcript Display */}
      {transcript && (
        <div className="glass rounded-xl p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
          <p className="text-sm text-muted-foreground mb-1">Your answer:</p>
          <p className="text-sm">{transcript}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={toggleRecording}
          disabled={disabled || isAISpeaking}
          variant={isRecording ? "destructive" : "default"}
          className="flex-1 gap-2"
          size="lg"
        >
          {isRecording ? (
            <>
              <MicOff className="h-5 w-5" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              Start Recording
            </>
          )}
        </Button>

        {transcript && (
          <Button
            onClick={handleSend}
            disabled={disabled || isAISpeaking}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center justify-center gap-2 text-sm text-destructive animate-pulse">
          <div className="h-2 w-2 rounded-full bg-destructive animate-ping" />
          Recording...
        </div>
      )}
    </div>
  );
}