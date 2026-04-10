const Job = require("../models/Job");

// @GET /api/jobs  — Public: all candidates & HR can view
const getJobs = async (req, res) => {
  try {
    const { search, type, location } = req.query;
    const filter = { isActive: true };

    if (search) filter.title = { $regex: search, $options: "i" };
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: "i" };

    const jobs = await Job.find(filter)
      .populate("postedBy", "name company")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/jobs/:id
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name company");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/jobs  — HR only
const createJob = async (req, res) => {
  try {
    const { title, description, location, type, salary, skills } = req.body;

    const job = await Job.create({
      title,
      description,
      location,
      type,
      salary,
      skills,
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

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };