const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  res.json([]);
});

router.post("/", async (req, res) => {
  res.json({
    success: true,
    assessment: req.body,
  });
});

module.exports = router;