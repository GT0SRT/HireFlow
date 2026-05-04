const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/:jobId", protect, authorize("candidate"), upload.single("resume"), applyToJob); // Candidate
router.get("/my", protect, authorize("candidate"), getMyApplications);           // Candidate
router.get("/job/:jobId", protect, authorize("hr"), getApplicationsForJob);      // HR
router.put("/:id/status", protect, authorize("hr"), updateApplicationStatus);    // HR

module.exports = router;