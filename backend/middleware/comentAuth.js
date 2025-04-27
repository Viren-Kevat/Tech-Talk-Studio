const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

let publicKeys = {}; // Cache for public keys
let keysFetchedAt = 0;

const fetchPublicKeys = async () => {
  try {
    const response = await fetch(
      "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
    );
    publicKeys = await response.json();
    keysFetchedAt = Date.now();
  } catch (err) {
    console.error("Error fetching Firebase public keys:", err);
  }
};

const comentAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Fetch Firebase public keys only if not fetched recently
    if (Date.now() - keysFetchedAt > 24 * 60 * 60 * 1000) {
      // 24 hours cache expiration
      await fetchPublicKeys();
    }

    // Decode the JWT header to get the `kid`
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header) {
      throw new Error("Invalid token: Unable to decode token header");
    }

    const kid = decodedHeader.header.kid;
    if (!kid || !publicKeys[kid]) {
      throw new Error("Invalid token: Key ID not found");
    }

    // Verify the token using the corresponding public key
    const decoded = jwt.verify(token, publicKeys[kid], {
      algorithms: ["RS256"],
      audience: process.env.FIREBASE_PROJECT_ID,
      issuer: `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID}`,
    });

    req.user = decoded; // Attach decoded token payload to the request
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = comentAuth;
