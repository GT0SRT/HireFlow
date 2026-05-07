const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/assessments", require("./routes/assessmentRoutes"));

// Health check
app.get("/", (req, res) => res.json({ message: "HireFlow API running" }));

// Health check for AI Engine
app.get("/api/health/ai-engine", async (req, res) => {
  try {
    const aiEngineUrl = process.env.AI_ENGINE_URL || "http://localhost:8000";
    const response = await fetch(`${aiEngineUrl}/`, {
      method: "GET",
      timeout: 5000
    });
    if (response.ok) {
      res.json({
        status: "connected",
        aiEngine: aiEngineUrl,
        message: "AI Engine is reachable"
      });
    } else {
      res.status(503).json({
        status: "error",
        aiEngine: aiEngineUrl,
        message: `AI Engine responded with status ${response.status}`
      });
    }
  } catch (error) {
    res.status(503).json({
      status: "disconnected",
      aiEngine: process.env.AI_ENGINE_URL || "http://localhost:8000",
      message: error.message
    });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));