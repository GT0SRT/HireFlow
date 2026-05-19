const Job = require("../models/Job");
const Application = require("../models/Application");

function _buildTestDescription(jd = {}) {
  const assessment = jd.assessment_plan || [];
  const interview = jd.interview_plan || [];

  const assessmentCount = assessment.length;
  const interviewCount = interview.length;

  const assessmentFocus = (assessment.slice(0, 2).map(s => s.test_type).filter(Boolean).join(', ')) || 'skills-based assessments';
  const interviewFocus = (interview.slice(0, 2).map(i => i.interview_round).filter(Boolean).join(', ')) || 'one or two interview rounds';

  return `You will go through ${assessmentCount} assessment stage(s) focused on ${assessmentFocus}, followed by ${interviewCount} interview round(s) including ${interviewFocus}. These steps evaluate technical fit, problem-solving, and role alignment.`;
}

// @GET /api/jobs  — Public: all candidates & HR can view
const getJobs = async (req, res) => {
  try {
    const { search, type, location, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };

    if (search) filter.title = { $regex: search, $options: "i" };
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: "i" };

    // Convert to integers and calculate skip logic
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const jobs = await Job.find(filter)
      .select("-job_description.assessment_plan -job_description.interview_plan")
      .populate("postedBy", "name company")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalJobs = await Job.countDocuments(filter);

    res.json({
      jobs,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalJobs / limitNumber),
      totalJobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .select("-job_description.assessment_plan -job_description.interview_plan")
      .populate("postedBy", "name company");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/jobs  — HR only
const createJob = async (req, res) => {
  try {
    const { title, jobNumber, job_description, location, type } = req.body;

    // ensure test_description persisted (fallback if AI or frontend omitted it)
    const jd = job_description || {};
    if (!jd.test_description) {
      jd.test_description = _buildTestDescription(jd);
    }

    const job = await Job.create({
      title,
      jobNumber,
      job_description: jd,
      location,
      type,
      company: req.user.company,
      postedBy: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/jobs/:id  — HR only (own job)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this job" });
    }

    // Prevent reassignment of job ownership
    const updateData = { ...req.body };
    delete updateData.postedBy;
    delete updateData.company;

    const updated = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/jobs/:id  — HR only (own job)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/jobs/my-jobs  — HR: see only their posted jobs
const getMyJobs = async (req, res) => {
  try {
    const jobFilter = process.env.NODE_ENV === "production" ? { postedBy: req.user._id } : {};
    const jobs = await Job.find(jobFilter).sort({ createdAt: -1 });

    const jobIds = jobs.map((job) => job._id);
    const applications = jobIds.length
      ? await Application.find({ job: { $in: jobIds } })
        .populate("candidate", "name email skills resume")
        .sort({ createdAt: -1 })
      : [];

    const applicationsByJob = applications.reduce((acc, application) => {
      const jobKey = application.job.toString();
      if (!acc[jobKey]) acc[jobKey] = [];
      acc[jobKey].push(application);
      return acc;
    }, {});

    const jobsWithApplicants = jobs.map((job) => ({
      ...job.toObject(),
      applicants: applicationsByJob[job._id.toString()] || [],
    }));

    res.json(jobsWithApplicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };