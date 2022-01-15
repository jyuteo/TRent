const isAuthenticated = (req, res, next) => {
  if (req.session.user.isAuth) {
    next();
  } else {
    return res
      .status(401)
      .json("You are not authenticated. Please log in first");
  }
};

const isAuthenticatedAndAuthorized = (req, res, next) => {
  isAuthenticated(req, res, () => {
    if (
      req.session.user.userContractAddress === req.params.userContractAddress
    ) {
      next();
    } else {
      return res.status(403).json("You don't have access for this");
    }
  });
};

export default { isAuthenticated, isAuthenticatedAndAuthorized };
