const Application = require("../models/Application");
const Job = require("../models/Job");

const ATS_SHORTLIST_THRESHOLD = Number(process.env.ATS_SHORTLIST_THRESHOLD || 70);
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";

const parseResumeFile = async (file) => {
  try {
    // Validate file exists and has buffer
    if (!file || !file.buffer) {
      throw new Error("No file buffer found");
    }

    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype || "application/octet-stream" });
    formData.append("file", blob, file.originalname || "resume.pdf");

    console.log(`[Resume Parser] Sending file: ${file.originalname}, Size: ${file.size}, MIME: ${file.mimetype}`);

    const response = await fetch(`${AI_ENGINE_URL}/api/resume-parser`, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();
    console.log(`[Resume Parser] Response status: ${response.status}`);

    if (!response.ok) {
      console.error(`[Resume Parser] Error response: ${responseText}`);
      throw new Error(`Resume parser failed with status ${response.status}`);
    }

    const result = JSON.parse(responseText);
    if (!result || Object.keys(result).length === 0) {
      throw new Error("Resume parser returned empty data");
    }

    console.log(`[Resume Parser] Successfully parsed resume`);
    return result;
  } catch (error) {
    console.error(`[Resume Parser] Error:`, error.message);
    throw error;
  }
};

const scoreResumeAgainstJob = async (jobDescription, resumeAnalysis) => {
  try {
    console.log(`[ATS Scorer] Starting ATS scoring...`);
    const response = await fetch(`${AI_ENGINE_URL}/api/ats-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jd_json: jobDescription, resume_json: resumeAnalysis }),
    });

    const responseText = await response.text();
    console.log(`[ATS Scorer] Response status: ${response.status}`);

    if (!response.ok) {
      console.error(`[ATS Scorer] Error response: ${responseText}`);
      throw new Error(`ATS scorer failed with status ${response.status}`);
    }

    const result = JSON.parse(responseText);
    console.log(`[ATS Scorer] Successfully scored resume`);
    return result;
  } catch (error) {
    console.error(`[ATS Scorer] Error:`, error.message);
    throw error;
  }
};

const parseScore = (value) => {
  const score = Number.parseFloat(value);
  return Number.isFinite(score) ? score : null;
};

// @POST /api/applications/:jobId  — Candidate applies
const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ message: "Job not found or closed" });
    }

    const existing = await Application.findOne({
      job: req.params.jobId,
      candidate: req.user._id,
    });
    if (existing) {
      return res.status(400).json({
        message: "You already applied to this job",
        isAlreadyApplied: true,
        screening: existing.screeningStatus && {
          threshold: existing.atsThreshold,
          score: existing.atsScore,
          status: existing.screeningStatus,
          reason: existing.screeningReason || null,
          resumeAnalysis: existing.resumeAnalysis,
          missingMandatorySkills: existing.missingMandatorySkills || [],
          interviewTopics: existing.interviewTopics || [],
        }
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a resume to submit your application." });
    }

    // Try to parse resume - if it fails, return error without saving
    let resumeAnalysis;
    try {
      console.log(`[Application] Starting resume parsing for job ${req.params.jobId}`);
      resumeAnalysis = await parseResumeFile(req.file);
    } catch (parseError) {
      console.error(`[Application] Resume parsing error: ${parseError.message}`);
      return res.status(422).json({
        message: "Failed to parse resume. Please ensure the file is valid and contains readable text. Try with a different file format.",
        error: parseError.message
      });
    }

    // Check if resumeAnalysis is empty or invalid
    if (!resumeAnalysis || Object.keys(resumeAnalysis).length === 0) {
      console.error(`[Application] Resume analysis is empty`);
      return res.status(422).json({
        message: "Resume parsing returned no data. Please ensure your resume contains readable text content.",
      });
    }

    console.log(`[Application] Resume parsed successfully. Starting ATS scoring...`);
    const atsResult = await scoreResumeAgainstJob(job.job_description || {}, resumeAnalysis);
    const atsScore = parseScore(atsResult.match_percentage);
    const screeningStatus = atsScore != null && atsScore >= ATS_SHORTLIST_THRESHOLD ? "Shortlisted" : "Not Shortlisted";

    console.log(`[Application] ATS Score: ${atsScore}, Status: ${screeningStatus}`);

    const application = await Application.create({
      job: req.params.jobId,
      candidate: req.user._id,
      coverLetter: req.body?.coverLetter,
      resumeUrl: req.body.resumeUrl || req.user.resume || null,
      resumeAnalysis,
      atsScore,
      atsThreshold: ATS_SHORTLIST_THRESHOLD,
      screeningStatus,
      screeningReason: atsResult.match_reasoning || null,
      missingMandatorySkills: atsResult.missing_mandatory_skills || [],
      interviewTopics: atsResult.personalized_interview_topics || [],
    });

    res.status(201).json({
      application,
      screening: {
        threshold: ATS_SHORTLIST_THRESHOLD,
        score: atsScore,
        status: screeningStatus,
        reason: atsResult.match_reasoning || null,
        resumeAnalysis,
        missingMandatorySkills: atsResult.missing_mandatory_skills || [],
        interviewTopics: atsResult.personalized_interview_topics || [],
      },
    });
  } catch (error) {
    console.error(`[Application] Unexpected error:`, error);
    res.status(500).json({
      message: "An error occurred while processing your application. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// @GET /api/applications/my  — Candidate: see their applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate("job", "title company location type salary")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/applications/job/:jobId  — HR: see all applicants for a job
const getApplicationsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("candidate", "name email skills resume")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/applications/:id/status  — HR: update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const progressMap = {
      Applied: 10,
      "Assessment Pending": 20,
      "Interview Scheduled": 55,
      Offered: 100,
      Rejected: 0,
    };

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        notes,
        progress: progressMap[status] ?? 10,
      },
      { new: true }
    ).populate("candidate", "name email");

    if (!application) return res.status(404).json({ message: "Application not found" });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
};