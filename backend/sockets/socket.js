const { Server } = require("socket.io");
const JWT = require("jsonwebtoken");

const verifyToken = require("../middlewares/verifyToken.js");
const {Conversation, Message, } = require("../models/MessageModel/messageModel.js");
const Notification = require("../models/NotificationModel/notificationModel.js");
const Project = require("../models/ProjectModel/projectModel.js");
const User = require("../models/usersModel/usersModel.js");

let io = null;

//* userId (string) -> Set of connected socket ids (a user can have many tabs/devices)
const onlineUsers = new Map();

//* Parses the raw "Cookie" header string into a { name: value } object.
function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((acc, pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return acc;
    const key = pair.slice(0, idx).trim();
    const value = decodeURIComponent(pair.slice(idx + 1).trim());
    if (key) acc[key] = value;
    return acc;
  }, {});
}

function initSocket(server, corsOrigin) {
  io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  //* Auth middleware - every socket connection must carry a valid auth cookie
  io.use((socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie || "");
      // Production: token from auth handshake
      // Localhost:  token from cookie
      const token = socket.handshake.auth?.token || cookies.token;
      if (!token) return next(new Error("Unauthorized"));
    
      const decoded = JWT.verify(token, verifyToken.secretKey);
      socket.userId = String(decoded.user_id);
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    //* Track presence
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    //* Personal room - lets us push notifications/messages to a user
    //* regardless of which page/conversation they currently have open.
    socket.join(`user:${userId}`);
    io.emit("presence:update", { userId, online: true });

    //* ── Project group-chat room ──
    socket.on("conversation:join", async ({ projectId }) => {
      if (!projectId) return;
      socket.join(`conversation:${projectId}`);
    });

    socket.on("conversation:leave", ({ projectId }) => {
      if (!projectId) return;
      socket.leave(`conversation:${projectId}`);
    });

    //* Typing indicator - shared by both project and direct chats (keyed by room name)
    socket.on("conversation:typing", ({ projectId, isTyping }) => {
      if (!projectId) return;
      socket.to(`conversation:${projectId}`).emit("conversation:typing", {
        projectId,
        userId,
        isTyping: !!isTyping,
      });
    });

    //* Send a message to a project's team chat (only when the project uses Built-in Chat)
    socket.on("message:send", async ({ projectId, text }, callback) => {
      try {
        if (!projectId || !text || !text.trim()) {
          return callback?.({ ok: false, error: "Message text is required" });
        }

        const project = await Project.findById(projectId).select(
          "userId teamMembers name communication",
        );
        if (!project)
          return callback?.({ ok: false, error: "Project not found" });

        if (
          project.communication &&
          project.communication !== "Built-in Chat"
        ) {
          return callback?.({
            ok: false,
            error: "This project uses an external communication channel",
          });
        }

        const isOwner = String(project.userId) === userId;
        const isMember = project.teamMembers?.some(
          (m) => String(m.userId) === userId && m.status === "approved",
        );
        if (!isOwner && !isMember) {
          return callback?.({
            ok: false,
            error: "Not authorized to message in this project",
          });
        }

        let conversation = await Conversation.findOne({
          project: projectId,
          type: "project",
        });
        const memberIds = [
          String(project.userId),
          ...project.teamMembers
            .filter((m) => m.status === "approved")
            .map((m) => String(m.userId)),
        ];

        if (!conversation) {
          conversation = await Conversation.create({
            type: "project",
            project: projectId,
            participants: [...new Set(memberIds)],
          });
        } else {
          //* keep participants list in sync with the current team
          conversation.participants = [...new Set(memberIds)];
        }

        const message = await Message.create({
          conversation: conversation._id,
          sender: userId,
          text: text.trim(),
          readBy: [userId],
        });
        await message.populate("sender", "fullname username profilePicture");

        conversation.lastMessage = text.trim();
        conversation.lastMessageAt = new Date();
        conversation.lastMessageSender = userId;
        await conversation.save();

        const payload = {
          _id: message._id,
          projectId,
          conversationId: conversation._id,
          text: message.text,
          sender: message.sender,
          createdAt: message.createdAt,
        };

        io.to(`conversation:${projectId}`).emit("message:new", payload);

        //* Notify participants who aren't the sender
        const others = memberIds.filter((id) => id !== userId);
        for (const recipientId of others) {
          const notif = await Notification.create({
            recipient: recipientId,
            sender: userId,
            type: "new_message",
            title: `New message in ${project.name}`,
            message: text.trim().slice(0, 120),
            project: projectId,
            conversation: conversation._id,
          });
          emitToUser(recipientId, "notification:new", notif);
        }

        callback?.({ ok: true, message: payload });
      } catch (err) {
        console.log(err);
        callback?.({ ok: false, error: "Failed to send message" });
      }
    });


    //* ── Direct 1:1 chat - requires an existing follow connection either way ──
    socket.on("dm:join", async ({ conversationId }, callback) => {
      try {
        //* 1. Validate that we received the conversation ID
        if (!conversationId) {
          return callback?.({
            ok: false,
            error: "conversationId is required",
          });
        }

        //* 2. Find the existing conversation
        const conversation = await Conversation.findOne({
          _id: conversationId,
          type: "direct",
          participants: { $all: [userId], $size: 2 },
        });

        //* 3. Conversation must exist
        if (!conversation) {
          return callback?.({
            ok: false,
            error: "Conversation not found",
          });
        }

        //* 4. Get the other participant
        const otherParticipantId = conversation.participants
          .map(String)
          .find((id) => id !== userId);

        if (!otherParticipantId) {
          return callback?.({
            ok: false,
            error: "Other participant not found",
          });
        }

        //* 5. Verify the other user still exists
        const other = await User.findById(otherParticipantId).select(
          "followers following",
        );

        if (!other) {
          return callback?.({
            ok: false,
            error: "User not found",
          });
        }

        //* 6. Verify follow relationship
        const isFollowing = other.followers.some((id) => String(id) === userId);

        const isFollowedBy = other.following.some(
          (id) => String(id) === userId,
        );

        if (!isFollowing && !isFollowedBy) {
          return callback?.({
            ok: false,
            error: "You can only message users you follow or who follow you",
          });
        }

        //* 7. Join the existing direct-message room
        socket.join(`conversation:dm:${conversation._id}`);

        //* 8. Return success + conversation ID
        callback?.({
          ok: true,
          conversationId: conversation._id,
          otherUserId: otherParticipantId,
        });
      } catch (err) {
        console.log("❌ dm:join error:", err);

        callback?.({
          ok: false,
          error: "Failed to open conversation",
        });
      }
    });

    socket.on("dm:send", async ({ conversationId, text }, callback) => {
      try {
        if (!conversationId || !text || !text.trim()) {
          return callback?.({ ok: false, error: "Message text is required" });
        }

        const conversation = await Conversation.findOne({
          _id: conversationId,
          type: "direct",
        });
        if (!conversation)
          return callback?.({ ok: false, error: "Conversation not found" });
        if (!conversation.participants.some((id) => String(id) === userId)) {
          return callback?.({
            ok: false,
            error: "Not a participant in this conversation",
          });
        }

        const message = await Message.create({
          conversation: conversation._id,
          sender: userId,
          text: text.trim(),
          readBy: [userId],
        });
        await message.populate("sender", "fullname username profilePicture");

        conversation.lastMessage = text.trim();
        conversation.lastMessageAt = new Date();
        conversation.lastMessageSender = userId;
        await conversation.save();

        const payload = {
          _id: message._id,
          conversationId: conversation._id,
          text: message.text,
          sender: message.sender,
          createdAt: message.createdAt,
        };

        io.to(`conversation:dm:${conversation._id}`).emit("dm:new", payload);

        const recipientId = conversation.participants
          .map(String)
          .find((id) => id !== userId);
        if (recipientId) {
          const notif = await Notification.create({
            recipient: recipientId,
            sender: userId,
            type: "new_message",
            title: "New message",
            message: text.trim().slice(0, 120),
            conversation: conversation._id,
          });
          emitToUser(recipientId, "notification:new", notif);
        }

        callback?.({ ok: true, message: payload });
      } catch (err) {
        console.log(err);
        callback?.({ ok: false, error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(userId);
          io.emit("presence:update", { userId, online: false });
        }
      }
    });
  });

  return io;
}

function getIO() {
  return io;
}

//* Push a realtime event straight to a specific user (all their open tabs)
function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

function isUserOnline(userId) {
  return onlineUsers.has(String(userId));
}

module.exports = { initSocket, getIO, emitToUser, isUserOnline };
