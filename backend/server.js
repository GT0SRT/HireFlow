const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const passport = require("./config/passport");

dotenv.config();
connectDB();

console.log("=== Environment Check ===");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Set" : "❌ Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Missing");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing");
console.log("========================");

const app = express();


const path = require("path");
app.use(express.json());
app.use(cookieParser());

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://webhireflow.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean); // This removes undefined/null values

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Only HTTPS in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/assessments", require("./routes/assessmentRoutes"));
// app.use("/uploads", express.static("uploads"));


// ✅ Serve static files with proper headers
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline'); // ✅ Browser mein open ho
    } else if (filepath.endsWith('.doc') || filepath.endsWith('.docx')) {
      res.setHeader('Content-Type', 'application/msword');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

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