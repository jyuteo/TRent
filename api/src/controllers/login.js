import Joi from "joi";
import logger from "../logger.js";
import User from "../db/models/User.js";
import CryptoJS from "crypto-js";

const loginFormInputSchema = Joi.object({
  ethAccountAddress: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const login = async (req, res) => {
  const inputValidation = loginFormInputSchema.validate(req.body, {
    stripUnknown: true,
  });

  if (inputValidation.error) {
    logger.error(`Request received: ${JSON.stringify(req.body)}`);
    logger.error(inputValidation.error.message);
    return res.status(400).json(inputValidation.error.message);
  }

  const { ethAccountAddress, username, password } = req.body;

  try {
    const user = await User.findOne({
      ethAccountAddress: ethAccountAddress,
    });

    if (!user) {
      return res.status(401).json("Ethereum wallet address is not registered");
    }

    const originalPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.CRYPTO_SEC_KEY
    ).toString(CryptoJS.enc.Utf8);

    if (username !== user.username || password !== originalPassword) {
      return res.status(401).json("Invalid login credentials");
    }

    const userDetails = {
      userContractAddress: user.userContractAddress,
      ethAccountAddress: ethAccountAddress,
      username: username,
    };

    req.session.user = { ...userDetails, isAuth: true };

    res.status(200).json({
      user: userDetails,
    });
  } catch (err) {
    res.status(500).json(err);
    res.end();
    logger.error(err);
  }
};

export default login;
