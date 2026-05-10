const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  generateAssessmentQuestions,
  submitAssessment,
} = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ✅ Specific routes FIRST — before /:jobId catches everything
router.get("/my", protect, authorize("candidate"), getMyApplications);
router.get("/job/:jobId", protect, authorize("hr"), getApplicationsForJob);
router.put("/:id/status", protect, authorize("hr"), updateApplicationStatus);

// Assessment routes — must be before /:jobId
router.post("/:applicationId/assessment/:assessmentIndex/generate", protect, authorize("candidate"), generateAssessmentQuestions);
router.post("/:applicationId/assessment/:assessmentIndex/submit", protect, authorize("candidate"), submitAssessment);

// ✅ Generic /:jobId route LAST
router.post("/:jobId", protect, authorize("candidate"), upload.single("resume"), applyToJob);

module.exports = router;