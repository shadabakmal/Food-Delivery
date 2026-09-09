const isAdmin = (req, res, next) => {
  if (req.isGuest || !req.userId) {
    return res.status(401).json({ success: false, message: "Please log in to continue." });
  }

  if (req.userRole !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }

  next();
};

export default isAdmin;
