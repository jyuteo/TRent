const logout = async (req, res) => {
  if (req.session.user) {
    try {
      delete req.session.user;
      res.status(200).json("Logout successful");
    } catch (err) {
      res.status(400).json(err);
    }
  } else {
    res.json("Not logged in");
  }
};

export default logout;
