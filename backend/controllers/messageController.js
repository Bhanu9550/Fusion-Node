const express = require("express");
const messageController = express.Router();

const verifyToken = require("../middlewares/verifyToken.js");
const { Conversation, Message } = require("../models/MessageModel/messageModel.js");
const Project = require("../models/ProjectModel/projectModel.js");
const User = require("../models/usersModel/usersModel.js");

messageController.use(verifyToken);

//* Small helper - confirms the current user belongs to the project's team
async function assertProjectMember(projectId, userId) {
  const project = await Project.findById(projectId).select("userId teamMembers name logoUrl communication communicationLink");
  if (!project) return { ok: false, status: 404, message: "Project not found" };

  const isOwner = String(project.userId) === String(userId);
  const isMember = project.teamMembers?.some(
    (m) => String(m.userId) === String(userId) && m.status === "approved",
  );
  if (!isOwner && !isMember) {
    return { ok: false, status: 403, message: "You are not a member of this project" };
  }
  return { ok: true, project };
}

//* actionType: 'read' (Check if allowed to view) or 'write' (Check if allowed to send)
async function assertDirectMessageAccess(userId, otherUserId, actionType = 'read') {
  if (String(userId) === String(otherUserId)) {
    return { ok: false, status: 400, message: "You can't message yourself" };
  }

  //* Fetch user details including followers/following
  const other = await User.findById(otherUserId).select("fullname username profilePicture followers following");
  if (!other) return { ok: false, status: 404, message: "User not found" };

  const isFollowing = other.followers.some((id) => String(id) === String(userId));
  const isFollowedBy = other.following.some((id) => String(id) === String(userId));
  const hasConnection = isFollowing || isFollowedBy; 

  //* Check if a conversation already exists in DB
  let existingConversation = null;
  try {
    existingConversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: [userId, otherUserId], $size: 2 },
    });
  } catch (e) {}

  //* LOGIC FOR READING (GET /direct/:userId)
  if (actionType === 'read') {
    //* If a conversation exists, allow viewing history even if connection is lost
    if (existingConversation) {
      return { 
        ok: true, 
        other, 
        hasActiveConnection: hasConnection, // Tell frontend if they can still SEND
        message: "History accessible"
      };
    }
    
    //* If NO conversation exists, they MUST have a connection to start one
    if (!hasConnection) {
      return { 
        ok: false, 
        status: 403, 
        message: "You cannot message this user unless you follow each other." 
      };
    }
    return { ok: true, other, hasActiveConnection: true };
  }

  //* LOGIC FOR SENDING (POST /direct/:userId & Socket)
  if (actionType === 'write') {
    if (!hasConnection) {
      return { 
        ok: false, 
        status: 403, 
        message: "You can only send messages to users who follow each other." 
      };
    }
    return { ok: true, other };
  }
  return { ok: false, status: 500, message: "Invalid action type" };
}

//* List all of the current user's conversations
messageController.get("/", async (req, res) => {
  try {
    const userId = req.user.user_id;
    const conversations = await Conversation.find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .populate("project", "name logoUrl")
      .populate("participants", "fullname username profilePicture")
      .populate("lastMessageSender", "fullname username");

    const shaped = conversations.map((c) => {
      const obj = c.toObject();
      if (obj.type === "direct") {
        obj.otherUser = obj.participants.find((p) => String(p._id) !== String(userId)) || null;
      }
      return obj;
    });

    res.json({ conversations: shaped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//* Get (or lazily create) a project's conversation
messageController.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const check = await assertProjectMember(projectId, req.user.user_id);
    if (!check.ok) return res.status(check.status).json({ message: check.message });

    if (check.project.communication && check.project.communication !== "Built-in Chat") {
      return res.json({
        externalCommunication: true,
        communication: check.project.communication,
        communicationLink: check.project.communicationLink,
        project: check.project,
      });
    }

    const memberIds = [
      String(check.project.userId),
      ...check.project.teamMembers
        .filter((m) => m.status === "approved")
        .map((m) => String(m.userId)),
    ];

    let conversation = await Conversation.findOne({ project: projectId, type: "project" });
    if (!conversation) {
      conversation = await Conversation.create({
        type: "project",
        project: projectId,
        participants: [...new Set(memberIds)],
      });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate("sender", "fullname username profilePicture");

    await Message.updateMany(
      { conversation: conversation._id, readBy: { $ne: req.user.user_id } },
      { $addToSet: { readBy: req.user.user_id } },
    );

    res.json({
      externalCommunication: false,
      conversationId: conversation._id,
      project: check.project,
      messages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

//* REST fallback for sending a project-chat message
messageController.post("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Message text is required" });

    const check = await assertProjectMember(projectId, req.user.user_id);
    if (!check.ok) return res.status(check.status).json({ message: check.message });
    if (check.project.communication && check.project.communication !== "Built-in Chat") {
      return res.status(400).json({ message: "This project uses an external communication channel" });
    }

    let conversation = await Conversation.findOne({ project: projectId, type: "project" });
    const memberIds = [
      String(check.project.userId),
      ...check.project.teamMembers
        .filter((m) => m.status === "approved")
        .map((m) => String(m.userId)),
    ];
    if (!conversation) {
      conversation = await Conversation.create({
        type: "project",
        project: projectId,
        participants: [...new Set(memberIds)],
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.user_id,
      text: text.trim(),
      readBy: [req.user.user_id],
    });
    await message.populate("sender", "fullname username profilePicture");

    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    conversation.lastMessageSender = req.user.user_id;
    await conversation.save();

    res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

//* GET Direct Message Thread (Updated Logic)
messageController.get("/direct/:userId", async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    
    // Use the new helper with 'read' action
    const check = await assertDirectMessageAccess(req.user.user_id, otherUserId, 'read');
    
    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    let conversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: [req.user.user_id, otherUserId], $size: 2 },
    });
    
    // Only create conversation if no history exists AND connection is active
    if (!conversation && check.hasActiveConnection) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [req.user.user_id, otherUserId],
      });
    }

    const messages = await Message.find({ conversation: conversation?._id })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate("sender", "fullname username profilePicture");

    // Mark as read if conversation exists
    if (conversation) {
      await Message.updateMany(
        { conversation: conversation._id, readBy: { $ne: req.user.user_id } },
        { $addToSet: { readBy: req.user.user_id } },
      );
    }

    res.json({
      conversationId: conversation?._id,
      otherUser: check.other,
      hasActiveConnection: check.hasActiveConnection, // Pass flag to frontend
      messages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

//* POST Direct Message (Updated Logic)
messageController.post("/direct/:userId", async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Message text is required" });

    // Use the new helper with 'write' action (Strictly requires connection)
    const check = await assertDirectMessageAccess(req.user.user_id, otherUserId, 'write');
    if (!check.ok) {
      return res.status(check.status).json({ message: check.message });
    }

    let conversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: [req.user.user_id, otherUserId], $size: 2 },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [req.user.user_id, otherUserId],
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.user_id,
      text: text.trim(),
      readBy: [req.user.user_id],
    });
    await message.populate("sender", "fullname username profilePicture");

    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    conversation.lastMessageSender = req.user.user_id;
    await conversation.save();

    res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

//* Delete a direct conversation
messageController.delete("/direct/:userId", async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const conversation = await Conversation.findOne({
      type: "direct",
      participants: { $all: [req.user.user_id, otherUserId], $size: 2 },
    });
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    await Message.deleteMany({ conversation: conversation._id });
    await Conversation.deleteOne({ _id: conversation._id });

    res.json({ message: "Conversation deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = messageController;