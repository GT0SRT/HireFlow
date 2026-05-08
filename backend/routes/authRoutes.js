const express = require("express");
const router = express.Router();
const { register, login, refreshAccessToken, logout, getMe, updateMe,googleCallback } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const passport = require("passport");



router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

// Google OAuth routes - only if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/google",
    (req, res, next) => {
      const { role } = req.query; // Get role from query parameter
      passport.authenticate("google", {
        scope: ["profile", "email"],
        state: role || "candidate", // Pass role via state
      })(req, res, next);
    }
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { 
      failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed`,
      session: false 
    }),
    googleCallback
  );
} else {
  // Fallback routes when Google OAuth is not configured
  router.get("/google", (req, res) => {
    res.status(503).json({ 
      message: "Google authentication is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file" 
    });
  });

  router.get("/google/callback", (req, res) => {
    res.status(503).json({ 
      message: "Google authentication is not configured" 
    });
  });
}


module.exports = router;