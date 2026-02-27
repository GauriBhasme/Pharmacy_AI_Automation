export default function authorizeAdmin(req, res, next) {
  try {
    // Check if user exists (authenticate should have set this)
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: Please login first",
      });
    }

    // Check role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden: Admin access only",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
}