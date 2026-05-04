const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    jobNumber: { type: String },
    job_description: {
      primary_role: { type: String },
      job_summary: { type: String },
      experience_years: { type: String },
      mandatory_technical_skills: [{ type: String }],
      nice_to_have_skills: [{ type: String }],
      soft_skills: [{ type: String }],
      key_responsibilities: [{ type: String }],
      requirements: [{ type: String }],
      test_description: { type: String },
      assessment_plan: [
        {
          test_type: { type: String },
          focus_topics: [{ type: String }],
          suggested_duration_minutes: { type: Number },
        },
      ],
      interview_plan: [
        {
          interview_round: { type: String },
          focus_topics: [{ type: String }],
        },
      ],
    },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);