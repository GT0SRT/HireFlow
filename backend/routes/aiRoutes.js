const express = require("express");
const router = express.Router();
const { generateJdFromAi } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/generate-jd", protect, authorize("hr"), generateJdFromAi);

module.exports = router;