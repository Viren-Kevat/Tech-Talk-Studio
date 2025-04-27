// middleware/auth.js
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const response = await fetch(
      "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
    );
    const publicKeys = await response.json();

    const decodedHeader = jwt.decode(token, { complete: true });
    const kid = decodedHeader?.header?.kid;

    if (!kid || !publicKeys[kid]) {
      throw new Error("Invalid token: Key ID not found");
    }

    const decoded = jwt.verify(token, publicKeys[kid], {
      algorithms: ["RS256"],
      audience: process.env.FIREBASE_PROJECT_ID,
      issuer: `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID}`,
    });

    req.user = { firebaseUid: decoded.user_id }; // Attach firebaseUid to req.user
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = auth;
