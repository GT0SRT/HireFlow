import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import api from "@/api/api";
import { toast } from "sonner";

interface ApplicationFormModalProps {
  open: boolean;
  onClose: () => void;
  job: {
    _id: string;
    title: string;
    [key: string]: unknown;
  } | null;
}

export default function ApplicationFormModal({
  open,
  onClose,
  job,
}: ApplicationFormModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    github: "",
    linkedin: "",
    resume: null,
    coverLetter: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!job) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // For file upload
    if ((e.target as HTMLInputElement).files) {
      const { files } = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: files ? files[0] : null,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (!job?._id) return;

    try {
      setSubmitting(true);
      await api.post(`/applications/${job._id}`, {
        coverLetter: formData.coverLetter,
      });
      toast.success("Application submitted successfully");
      onClose();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to submit application";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 rounded-xl"
      >
        {/* Sticky Header */}
        <DialogHeader
          className="sticky top-0 bg-background z-20 px-8 py-4 border-b border-white/10 shadow-sm"
        >
          <DialogTitle className="text-2xl font-semibold">
            Apply for {job.title}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="px-8 py-6 space-y-10">

          {/* SECTION : Resume */}
          <div>
            <h2 className="text-lg font-medium mb-4">Resume</h2>

            <div className="space-y-2">
              <Label>Upload Resume (PDF)</Label>
              <Input
                type="file"
                name="resume"
                accept="application/pdf"
                onChange={handleChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Only PDF files. Max 5MB.
              </p>
            </div>
          </div>

          {/* SECTION : Cover Letter */}
          <div>
            <h2 className="text-lg font-medium mb-4">Cover Letter</h2>

            <Textarea
              name="coverLetter"
              placeholder="Write something about why you're a great fit..."
              className="min-h-[120px]"
              onChange={handleChange}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <Button className="w-full h-12 text-base" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}