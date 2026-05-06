const express = require("express");
const router = express.Router();
const multer = require("multer");
const { generateJdFromAi, parseResumeProxy, parseAndScoreResume } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/generate-jd", protect, authorize("hr"), generateJdFromAi);
router.post("/parse-resume", upload.single("file"), parseResumeProxy);
router.post("/parse-and-score", upload.single("file"), parseAndScoreResume);

module.exports = router;