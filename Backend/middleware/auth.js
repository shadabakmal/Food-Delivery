import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  // Fail loudly at request time if the secret was never configured.
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables.");
    return res.status(500).json({ success: false, message: "Server misconfiguration" });
  }

  const authHeader = req.headers.authorization || req.headers.token || req.headers["token"];

  if (!authHeader) {
    req.userId = null;
    req.isGuest = true;
    return next();
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.isGuest = false;
    next();
  } catch (error) {
    // Token was provided but is invalid/expired -> reject.
    console.warn("JWT verification failed:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token. Please log in again." });
  }
};

export default authMiddleware;
