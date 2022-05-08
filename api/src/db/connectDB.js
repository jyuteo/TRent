import mongoose from "mongoose";
import logger from "../logger.js";

const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => logger.info("DB connection successful"))
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
};

export default connectDB;
