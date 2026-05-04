const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── Multer Setup (resume upload) ───────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/resumes";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF, DOC, DOCX allowed"));
  },
});

// @GET /api/profile/me — apna profile dekho
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/profile/update — profile update karo
const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, skills } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        phone,
        location,
        bio,
        // skills string aa sakti hai ya array — dono handle karo
        skills: Array.isArray(skills)
          ? skills
          : skills?.split(",").map(s => s.trim()).filter(Boolean),
      },
      { new: true }
    ).select("-password -refreshToken");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/profile/upload-resume — resume upload karo
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resumeUrl = `${req.protocol}://${req.get("host")}/uploads/resumes/${req.file.filename}`;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { resume: resumeUrl },
      { new: true }
    ).select("-password -refreshToken");

    res.json({ message: "Resume uploaded", resume: updated.resume, user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/profile/:userId — HR candidate ka profile dekhe
const getCandidateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password -refreshToken -refreshToken -email");

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "candidate") {
      return res.status(403).json({ message: "Not a candidate profile" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyProfile, updateProfile, uploadResume, upload, getCandidateProfile };