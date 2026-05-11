const express = require("express");
const router = express.Router();
const {
  startInterview,
  sendChatMessage,
  completeInterview,
  getMyCandidateInterviews,
  getJobInterviews,
  getInterviewDetails,
} = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Candidate routes
router.post("/start", protect, authorize("candidate"), startInterview);
router.post("/:interviewId/chat", protect, sendChatMessage);
router.post("/:interviewId/complete", protect, completeInterview);
router.get("/my", protect, authorize("candidate"), getMyCandidateInterviews);

// HR routes
router.get("/job/:jobId", protect, authorize("hr"), getJobInterviews);

// Shared
router.get("/:interviewId", protect, getInterviewDetails);

module.exports = router;