const express = require("express");
const notificationController = express.Router();

const verifyToken = require("../middlewares/verifyToken.js");
const Notification = require("../models/NotificationModel/notificationModel.js");

notificationController.use(verifyToken);

//* Get current user's notifications (most recent first)
notificationController.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.user_id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "fullname username profilePicture")
      .populate("project", "name logoUrl");
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.user_id,
      isRead: false,
    });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//* Mark a single notification as read
notificationController.patch("/:id/read", async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.user_id },
      { isRead: true },
      { returnDocument: "after" },
    );
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.json({ notification: notif });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//* Mark all notifications as read
notificationController.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.user_id, isRead: false },
      { isRead: true },
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//* Delete a notification
notificationController.delete("/:id", async (req, res) => {
  try {
    await Notification.deleteOne({ _id: req.params.id, recipient: req.user.user_id });
    res.json({ message: "Notification removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = notificationController;
