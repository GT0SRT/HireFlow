const Interview = require("../models/Interview");
const Application = require("../models/Application");
const Job = require("../models/Job");
const axios = require("axios");

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

// @POST /api/interviews/start - Start interview session
const startInterview = async (req, res) => {
  try {
    const { applicationId, difficulty } = req.body;
    
    const application = await Application.findById(applicationId)
      .populate("job")
      .populate("candidate");
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Check if user is the candidate
    if (application.candidate._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // Create interview session
    const interview = await Interview.create({
      candidate: req.user._id,
      job: application.job._id,
      application: applicationId,
      company: application.job.company,
      role_name: application.job.title,
      topics: application.job.job_description?.mandatory_technical_skills || [],
      difficulty: difficulty || "moderate",
      resume_summary: `Candidate with skills: ${req.user.skills?.join(", ") || "Not specified"}`,
      status: "in_progress",
      scheduled_at: new Date(),
    });
    
    res.status(201).json({
      message: "Interview session started",
      interview,
    });
  } catch (error) {
    console.error("Start interview error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/interviews/:interviewId/chat - Send message to AI interviewer
const sendChatMessage = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { message, duration_sec } = req.body;
    
    const interview = await Interview.findById(interviewId);
    
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    if (interview.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // Add user message to transcript
    interview.transcript.push({
      speaker: "candidate",
      text: message,
    });
    
    // Update duration
    interview.duration_sec = duration_sec || interview.duration_sec;
    
    // Format chat history for AI
    const chatHistory = interview.transcript.map(t => ({
      role: t.speaker === "candidate" ? "user" : "assistant",
      content: t.text,
    }));
    
    // Call AI Engine
    const aiResponse = await axios.post(`${AI_ENGINE_URL}/interviewer`, {
      message,
      history: chatHistory.slice(0, -1), // Don't include current message
      company: interview.company,
      role_name: interview.role_name,
      topics: interview.topics,
      resume_summary: interview.resume_summary,
      interview_duration_sec: interview.duration_sec,
      difficulty: interview.difficulty,
    });
    
    const aiReply = aiResponse.data.reply;
    
    // Add AI response to transcript
    interview.transcript.push({
      speaker: "interviewer",
      text: aiReply,
    });
    
    await interview.save();
    
    res.json({
      reply: aiReply,
      allotted_time_sec: aiResponse.data.allotted_time_sec,
      interview_ended: aiResponse.data.interview_ended,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/interviews/:interviewId/complete - End interview and get analysis
const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    const interview = await Interview.findById(interviewId);
    
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    if (interview.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // Format transcript for analysis
    const transcriptForAnalysis = interview.transcript.map(t => ({
      speaker: t.speaker,
      text: t.text,
    }));
    
    // Call AI Engine for analysis
    const analysisResponse = await axios.post(`${AI_ENGINE_URL}/analyze`, {
      transcript: transcriptForAnalysis,
      company: interview.company,
      role_name: interview.role_name,
      topics: interview.topics,
      resume_summary: interview.resume_summary,
      interview_duration_sec: interview.duration_sec,
    });
    
    // Save analysis
    interview.analysis = analysisResponse.data;
    interview.status = "completed";
    interview.completed_at = new Date();
    
    await interview.save();
    
    // Update application with interview score
    if (interview.application) {
      await Application.findByIdAndUpdate(interview.application, {
        interviewScore: interview.analysis.overall_score * 10, // Convert to percentage
        status: "Interview Scheduled", // Or next status
      });
    }
    
    res.json({
      message: "Interview completed successfully",
      analysis: interview.analysis,
    });
  } catch (error) {
    console.error("Complete interview error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/interviews/my - Get candidate's interviews
const getMyCandidateInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ candidate: req.user._id })
      .populate("job", "title company")
      .sort({ createdAt: -1 });
    
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/interviews/job/:jobId - HR get all interviews for a job
const getJobInterviews = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Verify HR owns this job
    const job = await Job.findById(jobId);
    if (!job || job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    const interviews = await Interview.find({ job: jobId, status: "completed" })
      .populate("candidate", "name email skills")
      .sort({ completed_at: -1 });
    
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/interviews/:interviewId - Get interview details
const getInterviewDetails = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId)
      .populate("candidate", "name email skills")
      .populate("job", "title company");
    
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    // Check authorization (candidate or HR who posted the job)
    const job = await Job.findById(interview.job._id);
    const isCandidate = interview.candidate._id.toString() === req.user._id.toString();
    const isHR = job && job.postedBy.toString() === req.user._id.toString();
    
    if (!isCandidate && !isHR) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startInterview,
  sendChatMessage,
  completeInterview,
  getMyCandidateInterviews,
  getJobInterviews,
  getInterviewDetails,
};