

const express = require("express");
const router = express.Router();
const { 
  getMyProfile, 
  updateProfile, 
  uploadResume, 
  upload, 
  getCandidateProfile,
  viewCandidateResume 
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, getMyProfile);
router.put("/update", protect, updateProfile);
router.post("/upload-resume", protect, upload.single("resume"), uploadResume);

// HR ke liye - candidate profile aur resume
router.get("/resume/:userId", protect, viewCandidateResume);
router.get("/:userId", protect, getCandidateProfile);


module.exports = router;