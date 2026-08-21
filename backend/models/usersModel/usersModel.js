const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    //* Registration
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.(com|in|ai|co)$/,
        "Enter a valid email ending with .com, .in, .ai, or .co",
      ],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hashedPass:{
      type: String
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      match: [/^[A-Z][a-zA-Z0-9._@#\-]*[a-zA-Z0-9._@#\-]$/, "Must start with Capital letter, use letters/numbers, min 8 characters."],
    },

    //* Profile
    profilePicture: {
      type: String,
      default: null,
    },
    coverPicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
    },
    designation: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      default: "",
    },

    //* Authentication
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },

    //* Account Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    //* Notifications
    emailNotification: {
      type: Number,
      default: 0,
    },
    pushNotification: {
      type: Number,
      default: 0,
    },

    //* Social Links
    github: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    portfolio: {
      type: String,
      default: "",
    },

    //* Statistics
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    //* Privacy - private profiles require an approved follow request before someone can follow
    isPrivate: {
      type: Boolean,
      default: false,
    },
    //* Incoming follow requests awaiting this user's decision
    followRequests: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    //* Saved / bookmarked projects
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    //* Profile Completion
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
