import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

/* -------------------------------------------
   🟢 Define Props Interface (Fixes Red Underlines)
-------------------------------------------- */
interface ApplicationFormModalProps {
  open: boolean;
  onClose: () => void;
  job: {
    title: string;
    [key: string]: any; // allows extra fields
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

  const handleSubmit = () => {
    console.log("Submitted Application →", job.title, formData);
    onClose();
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

          {/* SECTION : Personal Details */}
          <div>
            <h2 className="text-lg font-medium mb-4">Personal Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  name="fullName"
                  placeholder="John Doe"
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  placeholder="john@example.com"
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  name="phone"
                  placeholder="+91 9876543210"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* SECTION : Professional Links */}
          <div>
            <h2 className="text-lg font-medium mb-4">Professional Links</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>GitHub Profile</Label>
                <Input
                  name="github"
                  placeholder="https://github.com/username"
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>LinkedIn Profile</Label>
                <Input
                  name="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  onChange={handleChange}
                />
              </div>
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
          <Button className="w-full h-12 text-base" onClick={handleSubmit}>
            Submit Application
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}