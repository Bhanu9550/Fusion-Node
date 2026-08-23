const express = require('express')
const app = express()
 
const { connectRedis } = require("./config/redisConfigure.js");

//* Loading env
require('dotenv').config();

const http = require('http')
const server = http.createServer(app)

const cors = require('cors')
app.use(cors({
    origin : process.env.Frontend_Origin,
    credentials: true
}))   //* CORS

const path = require("path");

const cookieParser = require('cookie-parser')
app.use(cookieParser())   //* cookies - needed by verifyToken across every router

const connectDB = require('./db/connectDB.js')
connectDB()   //* connecting DataBase

const PORT = process.env.PORT  //* port from env

//* middlewares
app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(express.static('uploads'))

//* For socket Connection 
const JWT = require("jsonwebtoken");
const verifyToken = require("./middlewares/verifyToken.js");
app.get("/socket-token", verifyToken, (req, res) => {
  try {
    const socketToken = JWT.sign(
      { user_id: req.user.user_id },
      verifyToken.secretKey,
      { expiresIn: "5m" }
    );
    res.json({ token: socketToken });
  } catch (err) {
    console.error("Socket token error:", err);
    res.status(500).json({ message: "Failed to create socket token" });
  }
});

//* landingPage routes or controllers
const landingPageController = require('./controllers/landingPageController.js')
app.use('/', landingPageController)


//* dashboard routes or controllers
const dashboardController = require('./controllers/dashboardController.js')
app.use('/dashboard', dashboardController)

//* project page routes or controllers
const projectPageController = require('./controllers/projectPageController.js')
app.use('/projects', projectPageController)

//* notifications routes or controllers
const notificationController = require('./controllers/notificationController.js')
app.use('/notifications', notificationController)

//* messages routes or controllers
const messageController = require('./controllers/messageController.js')
app.use('/messages', messageController)

//* user profile / follow routes or controllers
const userController = require('./controllers/userController.js')
app.use('/users', userController)

//* Socket.io - real-time messaging & notifications
const { initSocket } = require('./sockets/socket.js')
initSocket(server, process.env.Frontend_Origin)

async function startServer() {
    try {
        // Connect Redis
        await connectRedis();

        server.listen(PORT, (err)=>{
            err? console.log(err): console.log(`server is Live at : http://localhost:${PORT}`);;
        });

    } catch (error) {
        console.error("Server startup failed:", error);
    }
}

startServer()