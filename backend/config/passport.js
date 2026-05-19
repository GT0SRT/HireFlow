require("dotenv").config();

const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Check if Google credentials exist
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  const logger = require('../utils/logger');
  logger.warn('Google OAuth credentials not found in .env file');
  logger.warn('Google authentication will not be available');
  logger.warn('Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it');
} else {
  // Only setup Google Strategy if credentials are available
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // User exists, return user
            return done(null, user);
          }

          // User doesn't exist, create new user
          // Role will be passed from frontend via state parameter
          const role = req.query.state || "candidate";

          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: Math.random().toString(36).slice(-8) + "Temp@123", // Random password
            role: role,
            googleId: profile.id,
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

module.exports = passport;