
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const logger = require("../utils/logger");

// Check if Cloudinary is configured
const useCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;

let upload;

if (useCloudinary) {
  // Cloudinary setup
  const { cloudinary, storage } = require("../config/cloudinary");

  upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
      const allowed = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only PDF, DOC, DOCX allowed"), false);
      }
    },
  });
} else {
  // Local storage setup
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

  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = [".pdf", ".doc", ".docx"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) cb(null, true);
      else cb(new Error("Only PDF, DOC, DOCX allowed"));
    },
  });
}

// @GET /api/profile/me
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/profile/update
const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, skills } = req.body;

    const updateData = {
      name,
      phone,
      location,
      bio,
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === "string"
          ? skills.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
    };

    const updated = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");

    res.json({ message: "Profile updated successfully", user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/profile/upload-resume
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (useCloudinary) {
      // Cloudinary upload
      const { cloudinary } = require("../config/cloudinary");

      // Delete old resume from Cloudinary
      if (user.resume && user.resumePublicId) {
        try {
          await cloudinary.uploader.destroy(user.resumePublicId, {
            resource_type: "raw", // Trying raw first (for older uploads)
          });
        } catch (error) {
          logger.warn("Error deleting old resume: %o", error);
        }
      }

      const resumeUrl = req.file.path; // Cloudinary URL
      const publicId = req.file.filename;

      const updated = await User.findByIdAndUpdate(
        req.user._id,
        {
          resume: resumeUrl,
          resumePublicId: publicId,
        },
        { new: true }
      ).select("-password -refreshToken");

      return res.json({
        message: "Resume uploaded successfully",
        resume: updated.resume,
        user: updated,
      });
    } else {
      // Local storage
      if (user.resume) {
        const oldFilename = user.resume.split("/").pop();
        const oldPath = path.join(__dirname, "..", "uploads", "resumes", oldFilename);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const resumeUrl = `${baseUrl}/uploads/resumes/${req.file.filename}`;

      const updated = await User.findByIdAndUpdate(
        req.user._id,
        { resume: resumeUrl },
        { new: true }
      ).select("-password -refreshToken");

      res.json({
        message: "Resume uploaded successfully",
        resume: updated.resume,
        user: updated,
      });
    }
  } catch (error) {
    logger.error("Resume upload error: %o", error);
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/profile/:userId
const getCandidateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password -refreshToken");

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "candidate") {
      return res.status(403).json({ message: "Not a candidate profile" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/profile/resume/:userId
const viewCandidateResume = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "candidate") {
      return res.status(403).json({ message: "Not a candidate profile" });
    }
    if (!user.resume) {
      return res.status(404).json({ message: "Resume not uploaded yet" });
    }

    // If Cloudinary or external URL - redirect
    if (user.resume.includes("cloudinary.com") || user.resume.startsWith("http")) {
      return res.redirect(user.resume);
    }

    // If local file
    const filename = user.resume.split("/").pop();
    const filePath = path.join(__dirname, "..", "uploads", "resumes", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Resume file not found on server" });
    }

    // Set headers to display in browser
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

    res.sendFile(filePath);
  } catch (error) {
    logger.error("View resume error: %o", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  uploadResume,
  upload,
  getCandidateProfile,
  viewCandidateResume,
};