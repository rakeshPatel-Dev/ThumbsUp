const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized. Please login.",
      });
    }

    if (roles.length === 0) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "No roles configured for this route.",
      });
    }

    // Check if user's role is allowed
    const userRole = req.user.role;

    console.log("User role:", userRole);    

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: `Forbidden. Only ${roles.join(",")} can access this route.`,
      });
    }

    next();
  };
};

export default authorizeRoles;
