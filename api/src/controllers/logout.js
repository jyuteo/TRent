import logger from "../logger.js";

const logout = async (req, res) => {
  if (req.session.user) {
    try {
      delete req.session.user;
      res.status(200).json("Logout successful");
      logger.info("Logout successful");
    } catch (err) {
      res.status(400).json(err);
      logger.error(`Unable to logout: {err}`);
    }
  } else {
    res.json("Not logged in");
    logger.error(`Unable to logout: not logged in`);
  }
};

export default logout;
