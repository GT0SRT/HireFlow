const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
    
    // Interview Configuration
    company: { type: String, required: true },
    role_name: { type: String, required: true },
    topics: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["basic", "moderate", "tough"],
      default: "moderate",
    },
    resume_summary: { type: String },
    
    // Interview Session Data
    transcript: [
      {
        speaker: { type: String, enum: ["interviewer", "candidate"] },
        text: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    
    duration_sec: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },
    
    // AI Analysis Results
    analysis: {
      overall_score: { type: Number, min: 0, max: 10 },
      metrics: {
        technical: { type: Number, min: 0, max: 10 },
        behavioral: { type: Number, min: 0, max: 10 },
        communication: { type: Number, min: 0, max: 10 },
        problem_solving: { type: Number, min: 0, max: 10 },
        company_knowledge: { type: Number, min: 0, max: 10 },
      },
      topics_covered: [{ type: String }],
      overall_assessment: { type: String },
      key_strengths: [{ type: String }],
      areas_for_improvement: [{ type: String }],
      recommendation: {
        type: String,
        enum: ["strong_yes", "yes", "maybe", "no"],
      },
      reasoning: { type: String },
    },
    
    // Scheduled time
    scheduled_at: { type: Date },
    completed_at: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);