const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  updateProfile,
  uploadResume,
  upload,
  getCandidateProfile,
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Candidate: apna profile
router.get("/me", protect, getMyProfile);
router.put("/update", protect, updateProfile);
router.post("/upload-resume", protect, authorize("candidate"), upload.single("resume"), uploadResume);

// HR: candidate ka profile dekhe
router.get("/:userId", protect, authorize("hr"), getCandidateProfile);

module.exports = router;