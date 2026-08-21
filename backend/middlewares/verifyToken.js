const JWT = require("jsonwebtoken");

const { loadEnvFile } = require("node:process");
loadEnvFile("./.env");

const secretKey = process.env.JWT_SECRET_KEY;

//* Shared auth middleware - reads the "token" cookie, verifies it,
//* and attaches { user_id } to req.user for downstream routes/controllers.
function verifyToken(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = JWT.verify(token, secretKey);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: `Invalid Token: ${err.message}` });
  }
}

module.exports = verifyToken;
module.exports.secretKey = secretKey;
