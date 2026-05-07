// const express = require("express");
// const router = express.Router();
// const {
//   getMyProfile,
//   updateProfile,
//   uploadResume,
//   upload,
//   getCandidateProfile,
// } = require("../controllers/profileController");
// const { protect } = require("../middleware/authMiddleware");
// const { authorize } = require("../middleware/roleMiddleware");

// // Candidate: apna profile
// router.get("/me", protect, getMyProfile);
// router.put("/update", protect, updateProfile);
// router.post("/upload-resume", protect, authorize("candidate"), upload.single("resume"), uploadResume);

// // HR: candidate ka profile dekhe
// router.get("/:userId", protect, authorize("hr"), getCandidateProfile);

// module.exports = router;














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
router.get("/:userId", protect, getCandidateProfile);
router.get("/resume/:userId", protect, viewCandidateResume); // New route

module.exports = router;