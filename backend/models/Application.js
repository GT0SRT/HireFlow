const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: { type: String },
    resumeUrl: { type: String },
    status: {
      type: String,
      enum: ["Applied", "Assessment Pending", "Interview Scheduled", "Offered", "Rejected"],
      default: "Applied",
    },
    progress: { type: Number, default: 10 }, // percentage
    notes: { type: String }, // HR internal notes
  },
  { timestamps: true }
);

// One candidate can apply to a job only once
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);