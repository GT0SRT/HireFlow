const Application = require("../models/Application");
const Job = require("../models/Job");
const { parseAndScoreResumeData } = require("./aiController");

const ATS_SHORTLIST_THRESHOLD = Number(process.env.ATS_SHORTLIST_THRESHOLD || 70);

const parseScore = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = Number(String(value).replace(/[^\d.\-]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
};

const mapParsedResume = (resumeAnalysis) => resumeAnalysis;

const mapAssessmentPlan = (assessmentPlan) => {
  if (!Array.isArray(assessmentPlan)) {
    return [];
  }

  return assessmentPlan
    .map((item) => ({
      testType: item.testType || item.test_type || "",
      coveredTopics: item.coveredTopics || item.focus_topics || [],
      questions: item.questions || [],
      answers: item.answers || [],
      suggestedDurationMinutes: item.suggestedDurationMinutes || item.suggested_duration_minutes || null,
      score: item.score || null,
      threshold: item.threshold || null,
      completedAt: item.completedAt || null,
    }))
    .filter((item) => item.testType);
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

    let attempts = 1;
    let existingId = null;

    if (existing) {
      const screening = existing.screening || {};
      const isShortlisted = screening.status === "Shortlisted" || ["Assessment Pending", "Interview Scheduled", "Offered", "Selected"].includes(existing.status);

      if (isShortlisted) {
        return res.status(400).json({
          message: "You already applied to this job",
          isAlreadyApplied: true,
          screening: screening.status ? {
            threshold: screening.atsThreshold ?? null,
            score: screening.atsScore ?? null,
            status: screening.status,
            reason: screening.reasoningForCandidate || null,
            hrReason: screening.reasoningForHR || null,
            parsedResume: existing.parsedResume || null,
            missingMandatorySkills: screening.missingMandatorySkills || [],
            attempts: screening.attempts || 1,
          } : undefined,
        });
      }

      attempts = (screening.attempts || 1) + 1;
      if (attempts > 3) {
        return res.status(403).json({
          message: "You have reached the maximum of 3 attempts for this job.",
          screening: {
            threshold: screening.atsThreshold ?? null,
            score: screening.atsScore ?? null,
            status: screening.status,
            reason: screening.reasoningForCandidate || null,
            hrReason: screening.reasoningForHR || null,
            parsedResume: existing.parsedResume || null,
            missingMandatorySkills: screening.missingMandatorySkills || [],
            attempts: attempts,
          }
        });
      }

      existingId = existing._id;
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a resume to submit your application." });
    }

    // Try to parse resume - if it fails, return error without saving
    let resumeAnalysis;
    let atsResult;
    try {
      console.log(`[Application] Starting resume parsing for job ${req.params.jobId}`);
      const aiResult = await parseAndScoreResumeData(req.file, job.job_description || {}, req.body.cachedParsedResume);
      resumeAnalysis = aiResult.parsedResume;
      atsResult = aiResult.atsResult;
    } catch (parseError) {
      if (parseError.status) {
        return res.status(parseError.status).json({
          message: parseError.message,
          error: process.env.NODE_ENV === "development" ? parseError.message : undefined,
        });
      }
      console.error(`[Application] Resume parsing error: ${parseError.message}`);
      return res.status(422).json({
        message: "Failed to parse resume. Please ensure the file is valid and contains readable text. Try with a different file format.",
        error: parseError.message
      });
    }

    // Only delete the existing application if the resume was successfully parsed
    if (existingId) {
      await Application.findByIdAndDelete(existingId);
    }

    // Check if resumeAnalysis is empty or invalid
    if (!resumeAnalysis || Object.keys(resumeAnalysis).length === 0) {
      console.error(`[Application] Resume analysis is empty`);
      return res.status(422).json({
        message: "Resume parsing returned no data. Please ensure your resume contains readable text content.",
      });
    }

    // Handle varying AI response keys and formats
    const rawScore = atsResult.match_percentage ?? atsResult.score ?? atsResult.ats_score ?? atsResult.atsScore ?? atsResult.matchPercentage;
    const atsScore = parseScore(rawScore);
    const screeningStatus = atsScore != null && atsScore >= ATS_SHORTLIST_THRESHOLD ? "Shortlisted" : "Not Shortlisted";
    const parsedResume = mapParsedResume(resumeAnalysis);
    const assessment = mapAssessmentPlan(job.job_description?.assessment_plan || []);

    console.log(`[Application] ATS Score: ${atsScore}, Status: ${screeningStatus}`);

    const application = await Application.create({
      job: req.params.jobId,
      candidate: req.user._id,
      status: "Applied",
      progress: 10,
      notes: "",
      coverLetter: req.body?.coverLetter,
      resumeUrl: req.body.resumeUrl || req.user.resume || null,
      parsedResume,
      screening: {
        atsScore,
        atsThreshold: ATS_SHORTLIST_THRESHOLD,
        status: screeningStatus,
        attempts,
        reasoningForCandidate: atsResult.reasoning_for_candidate || atsResult.reasoningForCandidate || atsResult.reason || "",
        reasoningForHR: atsResult.reasoning_for_hr || atsResult.reasoningForHR || "",
        missingMandatorySkills: atsResult.missing_mandatory_skills || atsResult.missingMandatorySkills || [],
        completedAt: new Date(),
      },
      assessment,
    });

    res.status(201).json({
      application,
      screening: {
        threshold: ATS_SHORTLIST_THRESHOLD,
        score: atsScore,
        status: screeningStatus,
        attempts,
        reason: atsResult.reasoning_for_candidate || atsResult.reasoningForCandidate || atsResult.reason || null,
        hrReason: atsResult.reasoning_for_hr || atsResult.reasoningForHR || null,
        parsedResume,
        missingMandatorySkills: atsResult.missing_mandatory_skills || atsResult.missingMandatorySkills || [],
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
      .populate("job", "title company location type salary job_description")
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