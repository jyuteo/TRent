import User from "../db/models/User.js";
import CryptoJS from "crypto-js";
import logger from "../logger.js";
import Joi from "joi";

const registerFormInputSchema = Joi.object({
  userContractAddress: Joi.string().required(),
  ethAccountAddress: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const register = async (req, res) => {
  const inputValidation = registerFormInputSchema.validate(req.body, {
    stripUnknown: true,
  });

  if (inputValidation.error) {
    logger.error(`Request received: ${JSON.stringify(req.body)}`);
    logger.error(inputValidation.error.message);
    return res.status(400).json(inputValidation.error.message);
  }

  const { userContractAddress, ethAccountAddress, username, password } =
    req.body;
  const newUser = new User({
    userContractAddress: userContractAddress,
    ethAccountAddress: ethAccountAddress,
    username: username,
    password: CryptoJS.AES.encrypt(
      password,
      process.env.CRYPTO_SEC_KEY
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json({
      newUser: {
        userContractAddress: userContractAddress,
        ethAccountAddress: savedUser.ethAccountAddress,
        username: savedUser.username,
      },
    });
    logger.info(`New user account created for ${userContractAddress}`);
  } catch (err) {
    res.status(500).json(err);
    res.end();
    logger.error(err);
  }
};

export default register;
