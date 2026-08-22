const express = require("express");
const landingPageController = express.Router();

//* cookie-parser is applied globally in server.js
require('dotenv').config();

const User = require("../models/usersModel/usersModel.js");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyToken = require("../middlewares/verifyToken.js");

//* function for get the single User Details 
async function getUser(userId){
  try{
    const singleUser = await User.findOne({ _id : userId }).select("-password -hashedPass -__v");
    return singleUser
  } catch(err) {
    return err.message
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

//* SignUp API 
landingPageController.post("/signup", async (req, res) => {
  //* console.log(req.body);
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const userDetails = {
    fullname: req.body.fullname,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    hashedPass: hashedPassword,
  };
  try {
    const newUser = await User.create(userDetails);
    res.status(201).json({
      message: "Registration Successful",
    });
  } catch (err) {
    if (err.name == "ValidationError") {
      res.status(400).json({
        //* status code 400 for --> Bad Request
        error: err, //* For email and Password - regX validation error
      });
    } else if (err.errorResponse?.keyValue) {
      res.status(409).json({
        //* status code 409 for --> conflict duplicate resources
        response: err.errorResponse.keyValue,
        error: err.errorResponse.keyValue["email"]
          ? "Email already exist, Please login"
          : "Username already exist, Try new one",
      });
    } else {
      res.status(500).json({
        error: err.message,
      });
    }
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
    let isPasswordCorrect = false
    if(fetchData){
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
    const token = generateToken(fetchData._id)
    res.cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/"
    }) //* send token with cookie
    const oneUser = await getUser(fetchData._id) //*for send User, to initial rendering
    return res.status(200).json({
      //* if password match, generate JWT and send to frontend
      message: "Login successful",
      User  : oneUser
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

landingPageController.get('/me', verifyToken, async(req, res)=>{
    const userId = req.user.user_id
    const oneUser = await getUser(userId)
    res.json(oneUser) 
})

//* Logout API - clears the auth cookie
landingPageController.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
    });
    res.status(200).json({ message: 'Logged out successfully' })
})

module.exports = landingPageController;
