const express = require("express");
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/:jobId", protect, authorize("candidate"), applyToJob);             // Candidate
router.get("/my", protect, authorize("candidate"), getMyApplications);           // Candidate
router.get("/job/:jobId", protect, authorize("hr"), getApplicationsForJob);      // HR
router.put("/:id/status", protect, authorize("hr"), updateApplicationStatus);    // HR

module.exports = router;