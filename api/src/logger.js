import log4js from "log4js";

log4js.configure({
  appenders: {
    trent_api_dev: {
      type: "stdout",
    },
    trent_api_error: {
      type: "file",
      filename: "./logs/trent_error.log",
    },
  },
  categories: {
    default: { appenders: ["trent_api_dev"], level: "debug" },
    trent_api_error: {
      appenders: ["trent_api_error"],
      level: "debug",
    },
  },
});

const logger = log4js.getLogger("trent_api_dev");
const errorLogger = log4js.getLogger("trent_api_error");

export default logger;
export { errorLogger };
