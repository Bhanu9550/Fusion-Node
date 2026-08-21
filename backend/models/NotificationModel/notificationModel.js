const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    //* Who this notification is for
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    //* Who triggered it (optional - system notifications have no sender)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "join_request",       //* someone applied to your project
        "application_accepted",
        "application_rejected",
        "invite_received",    //* you were invited to a project
        "invite_accepted",
        "invite_declined",
        "member_removed",
        "member_left",
        "new_message",
        "role_filled",
        "project_update",
        "follow_request",
        "follow_accepted",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
