const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      enum: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "UI/UX Designer",
        "DevOps Engineer",
        "QA Tester",
        "Database Engineer",
        "AI/ML Engineer",
        "Mobile Developer",
        "Other",
      ],
    },
    numberRequired: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    responsibilities: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      enum: [
        "No Preference",
        "Student",
        "Fresher",
        "Junior",
        "Mid-Level",
        "Senior",
      ],
      default: "No Preference",
    },
    commitment: {
      type: String,
      enum: ["5 hrs/week", "10 hrs/week", "15 hrs/week", "Flexible"],
      default: "Flexible",
    },
    isFilled: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

const teamMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roleName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "left", "removed"],
      default: "pending",
    },
    joinedAt: { type: Date, default: Date.now },
    leftAt: Date,
    isInvited: { type: Boolean, default: false },
    invitedAt: Date,
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    leavingReason: String,
    leaveRequestSubject: String,
    leaveRequestStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    leaveRequestedAt: Date,
    leaveApprovedAt: Date,
    leaveApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: true },
);

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roleName: { type: String, required: true },
    message: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    portfolioLink: { type: String, default: "" },
    githubProfile: { type: String, default: "" },
    availability: {
      type: String,
      enum: ["full_time", "part_time", "weekends"],
      default: "full_time",
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const invitedMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedRole: { type: String, required: true },
    username: { type: String, default: "" },
    fullname: { type: String, default: "" },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Withdrawn"],
      default: "Pending",
    },
    createdAt: { type: Date, default: Date.now },
    respondedAt: Date,
  },
  { _id: true },
);

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName : {
      type : String,
      require: true
    },
    userPic : {
      type : String
    },
    //* About Project 
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Web Development",
        "Mobile App",
        "AI / ML",
        "Blockchain",
        "Cyber Security",
        "IoT",
        "Desktop Application",
        "Open Source",
        "Game Development",
        "Other",
      ],
    },
    stage: {
      type: String,
      enum: [
        "💡 Idea",
        "📋 Planning",
        "💻 Development",
        "🧪 Testing",
        "🚀 Deployment",
        "✅ Completed",
      ],
      default: "💡 Idea",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    repositoryType: {
      type: String,
      enum: ["none", "github"],
      default: "none",
    },
    repositoryUrl: { type: String, trim: true, default: "" },
    demoLink: { type: String, trim: true, default: "" },
    bannerImageUrl: { type: String, default: "" },
    logoUrl: { type: String, default: "" },

    //* Team 
    roles: [roleSchema],
    invitedMembers: [invitedMemberSchema],
    recruitmentStatus: {
      type: String,
      enum: ["open", "closed", "paused"],
      default: "open",
    },
    whoCanApply: {
      type: String,
      enum: ["everyone", "invite_only"],
      default: "everyone",
    },
    maxTeamSize: {
      type: Number,
      default: 10,
      min: 1,
    },
    joinApproval: {
      type: String,
      enum: ["owner", "owner_managers"],
      default: "owner",
    },
    membersCanInvite: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    leavingPolicy: {
      type: String,
      enum: ["anytime", "approval"],
      default: "anytime",
    },
    communication: {
      type: String,
      enum: ["Built-in Chat", "Discord", "Slack", "Google Meet", ""],
      default: "",
    },
    //* External invite/channel link - shown to the team once communication is Discord/Slack/Google Meet
    communicationLink: {
      type: String,
      trim: true,
      default: "",
    },
    completionDate: {
      type: Date,
      default: null,
    },
    teamMembers: [teamMemberSchema],
    applications: [applicationSchema],
    tags: { type: [String], default: [] },
    totalViews: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "active", "archived", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.index({ userId: 1, createdAt: -1 });

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
