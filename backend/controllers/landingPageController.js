const express = require("express");
const landingPageController = express.Router();

//* cookie-parser is applied globally in server.js
require("dotenv").config();

const User = require("../models/usersModel/usersModel.js");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyToken = require("../middlewares/verifyToken.js");
const { redisClient } = require("../config/redisConfigure.js");
const sendEmail = require("../utils/sendEmail.js");

//* function for get the single User Details
async function getUser(userId) {
  try {
    const singleUser = await User.findOne({ _id: userId }).select(
      "-password -hashedPass -__v",
    );
    return singleUser;
  } catch (err) {
    return err.message;
  }
}

landingPageController.get("/", (req, res) => {
  // res.sendFile(__dirname + "/templates/serverHome.html")
  res.send("backend ");
});

landingPageController.post("/userCheck", async (req, res) => {
  let userName = req.body.username;
  try {
    let isUserPresent = await User.findOne({ username: userName });
    if (isUserPresent) {
      res.status(409).json({
        error: "Username already exist, Try new one",
      });
    } else {
      res.status(200).json({
        message: "username approved",
      });
    }
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
});

// Helper to check Redis status
const isRedisReady = () => redisClient && redisClient.isOpen;

landingPageController.post("/send-otp", async (req, res) => {
  try {
      const { email } = req.body;
      if (!email || !email.includes('@')) {
          return res.status(400).json({ 
              error: "Please enter a valid email address." 
          });
      }
      //  Check Redis Availability
      if (!isRedisReady()) {
          return res.status(503).json({ 
              error: "OTP service temporarily unavailable. Please try again later." 
          });
      }
      const normalizedEmail = email.trim().toLowerCase();
      //  Check if Email Already Exists in DB
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
          return res.status(409).json({ 
              error: "Account already exists with this email. Please Sign In instead." 
          });
      }
      // Generate OTP (Only if user does not exist)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // Store in Redis (5 mins)
      await redisClient.setEx(`otp:${normalizedEmail}`, 300, otp);
      // Send Email
      await sendEmail(
          normalizedEmail,
          "Subject - Email Verification OTP",
          otp 
      );
      return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
      console.error("Send OTP Error:", err);
      // Handle specific errors if needed, otherwise generic
      let errorMessage = "Failed to send OTP.";
      if (err.name === 'ValidationError') {
           errorMessage = err.message;
      }
      return res.status(500).json({ error: errorMessage });
  }
});

//* SignUp API
landingPageController.post("/signup", async (req, res) => {
  try {
      const { fullname, username, email, password, otp } = req.body;      
      // Basic validation
      if (!fullname || !username || !email || !password || !otp) {
          return res.status(400).json({ error: "All fields including OTP are required." });
      }
      // Safety check for Render
      if (!isRedisReady()) {
          return res.status(503).json({ error: "Verification service unavailable. Try again soon." });
      }
      const normalizedEmail = email.trim().toLowerCase();
      // Get OTP from Redis
      const storedOtp = await redisClient.get(`otp:${normalizedEmail}`);
      if (!storedOtp) {
          return res.status(400).json({ error: "OTP expired or not found. Please request a new OTP." });
      }
      if (storedOtp !== otp.toString()) {
          return res.status(400).json({ error: "Invalid OTP. Please enter the correct OTP." });
      }
      // Create User
      const hashedPassword = await bcrypt.hash(password, 10);
      const userDetails = {
          fullname,
          username,
          email: normalizedEmail,
          password,
          hashedPass: hashedPassword,
      };
      const newUser = await User.create(userDetails);
      // Delete OTP after success
      await redisClient.del(`otp:${normalizedEmail}`);
      return res.status(201).json({ message: "Registration Successful" });
  } catch (err) {
      if (err.name === "ValidationError") {
          return res.status(400).json({ error: err.errors });
      } else if (err.code === 11000) { // Unique key conflict
           const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'duplicate';
           return res.status(409).json({ 
               error: field === 'email' ? "Email already exists" : "Username already exists" 
           });
      }
      return res.status(500).json({ error: err.message || "Registration failed" });
  }
});

const secretKey = process.env.JWT_SECRET_KEY;
function generateToken(user_id) {
  return JWT.sign({ user_id }, secretKey, { expiresIn: "1d" });
}

//* Signin API
landingPageController.post("/signin", async (req, res) => {
  const enteredUserEmail = req.body.user_email;
  const enteredPassword = req.body.password;

  //* checking request is username OR email
  const emailRegX =
    /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.(com|in|ai|co)$/;

  const query = emailRegX.test(enteredUserEmail)
    ? { email: enteredUserEmail } //* If user enters email return email
    : { username: enteredUserEmail }; //* else username

  try {
    const fetchData = await User.findOne(query);
    let isPasswordCorrect = false;
    if (fetchData) {
      isPasswordCorrect = await bcrypt.compare(
        enteredPassword,
        fetchData.hashedPass,
      );
    }
    if (!fetchData || !isPasswordCorrect) {
      return res
        .status(401)
        .json({ message: `Invalid email/userName or password` });
    }
    const token = generateToken(fetchData._id);
    res.cookie("token", token, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    }); //* send token with cookie
    const oneUser = await getUser(fetchData._id); //*for send User, to initial rendering
    return res.status(200).json({
      //* if password match, generate JWT and send to frontend
      message: "Login successful",
      User: oneUser,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

landingPageController.get("/me", verifyToken, async (req, res) => {
  const userId = req.user.user_id;
  const oneUser = await getUser(userId);
  res.json(oneUser);
});

// Route to strictly verify if the OTP matches Redis
landingPageController.post("/verify-otp", async (req, res) => {
  try {
      const { email, otp } = req.body;
      if (!email || !otp) {
          return res.status(400).json({ message: "Email and OTP are required." });
      }
      if (!isRedisReady()) {
          return res.status(503).json({ message: "Verification service unavailable. Try again soon." });
      }
      const normalizedEmail = email.trim().toLowerCase();
      // Get OTP from Redis
      const storedOtp = await redisClient.get(`otp:${normalizedEmail}`);
      if (!storedOtp) {
          return res.status(400).json({ message: "OTP expired or not found. Please request a new OTP." });
      }
      if (storedOtp !== otp.toString()) {
          return res.status(400).json({ message: "Invalid OTP. Please enter the correct OTP." });
      }
      // If we reach here, the OTP is correct!
      return res.status(200).json({ message: "OTP verified successfully." });
  } catch (err) {
      console.error("Verify OTP Error:", err);
      return res.status(500).json({ message: "Failed to verify OTP. Please try again." });
  }
});

landingPageController.post("/forgot-password/send-otp", async (req, res) => {
  try {
      const { email } = req.body;
      if (!email || !email.includes('@')) {
          return res.status(400).json({ 
              message: "Please enter a valid email address." 
          });
      }
      if (!isRedisReady()) {
          return res.status(503).json({ 
              message: "OTP service temporarily unavailable. Please try again later." 
          });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (!existingUser) {
          return res.status(404).json({ 
              message: "No account found with this email address." 
          });
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await redisClient.setEx(`otp:${normalizedEmail}`, 300, otp);
      await sendEmail(
          normalizedEmail,
          "Subject - Password Reset OTP",
          otp 
      );
      return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
      console.error("Forgot Password Send OTP Error:", err);
      let errorMessage = "Failed to send OTP.";
      if (err.name === 'ValidationError') {
           errorMessage = err.message;
      }
      return res.status(500).json({ message: errorMessage });
  }
});

landingPageController.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ message: "Email and new password are required." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate(
            { email: email },
            { 
                $set: { 
                    hashedPass: hashedPassword, 
                    password: newPassword 
                } 
            }
        );
        return res.status(200).json({ message: "Password has been successfully updated." });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ message: "Internal server error. Please try again later." });
    }
});

//* Logout API - clears the auth cookie
landingPageController.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = landingPageController;
