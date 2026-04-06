const express = require("express");
const router = express.Router();
const { getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs } = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/", getJobs);                                          // Public
router.get("/my-jobs", protect, authorize("hr"), getMyJobs);      // HR only
router.get("/:id", getJobById);                                    // Public
router.post("/", protect, authorize("hr"), createJob);            // HR only
router.put("/:id", protect, authorize("hr"), updateJob);          // HR only
router.delete("/:id", protect, authorize("hr"), deleteJob);       // HR only

module.exports = router;