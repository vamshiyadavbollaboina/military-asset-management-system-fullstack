export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient permissions",
      });
    }

    next();
  };
};

export const enforceBaseScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role === "ADMIN") {
    return next();
  }

  if (
    req.user.role === "BASE_COMMANDER" ||
    req.user.role === "LOGISTICS_OFFICER"
  ) {
    if (!req.user.baseId) {
      return res.status(403).json({
        success: false,
        message: "User is not assigned to a base",
      });
    }

    req.user.baseId = Number(req.user.baseId);
  }

  next();
};
