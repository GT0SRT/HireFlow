const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job", required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Assessment Pending", "Interview Scheduled", "Offered", "Rejected"],
      default: "Applied",
    },
    progress: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      default: "",
    },
    parsedResume: {
      executiveSummary: { type: String },
      primaryRole: { type: String },
      experienceYears: { type: String },
      topTechnicalSkills: [{ type: String }],
      notableProjects: [
        {
          name: { type: String },
          description: { type: String },
        },
      ],
      interviewDeepDiveTopics: [{ type: String }],
      rawData: { type: mongoose.Schema.Types.Mixed },
    },
    screening: {
      atsScore: { type: Number },
      atsThreshold: { type: Number },
      status: { type: String, enum: ["Shortlisted", "Not Shortlisted"] },
      attempts: { type: Number, default: 1 },
      reasoningForCandidate: { type: String },
      reasoningForHR: { type: String },
      missingMandatorySkills: [{ type: String }],
      completedAt: { type: Date },
    },
    assessment: [
      {
        testType: { type: String, required: true },
        coveredTopics: [{ type: String }],
        questions: [{ type: String }],
        answers: [{ type: String }],
        suggestedDurationMinutes: { type: Number },
        score: { type: Number },
        threshold: { type: Number },
        completedAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

// One candidate can apply to a job only once
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);