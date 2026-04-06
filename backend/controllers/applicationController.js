const Application = require("../models/Application");
const Job = require("../models/Job");

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
      return res.status(400).json({ message: "You already applied to this job" });
    }

    const application = await Application.create({
      job: req.params.jobId,
      candidate: req.user._id,
      coverLetter: req.body.coverLetter,
      resumeUrl: req.body.resumeUrl || req.user.resume,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
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