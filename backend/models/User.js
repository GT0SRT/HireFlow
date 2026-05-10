const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["candidate", "hr"],
      default: "candidate",
    },
    

    googleId: { type: String, sparse: true, unique: true },

    
    // Common fields for all users
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    
    // Candidate-specific fields
    bio: { type: String, trim: true },
    resume: { type: String }, // Resume file path/URL
     resumePublicId: { type: String },
    skills: [{ type: String }],
    
    // HR-specific fields
    company: { type: String },
    companyProfile: {
      website: { type: String },
      location: { type: String },
      industry: { type: String },
      about: { type: String },
      hiringEmail: { type: String },
    },
    
    // Token for refresh
    refreshToken: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);