import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";
import cors from "cors";
import logger from "./logger.js";
import authRouter from "./routers/authRouter.js";
import connectDB from "./db/connectDB.js";

dotenv.config();

const app = express();
connectDB();

const MongoDBStore = connectMongoDBSession(session);
const sessionStore = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: "sessions",
  autoRemove: "interval",
  autoRemoveInterval: 60, // clear expired sessions every hour
});

const corsOptions = {
  origin: [
    `${process.env.FRONTEND_URL}:${process.env.FRONTEND_PORT}`,
    "http://localhost:8888",
  ],
  credentials: true,
};

const sessionOptions = {
  secret: process.env.SESSION_SEC_KEY,
  resave: false,
  saveUninitialized: false,
  secure: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  store: sessionStore,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(session(sessionOptions));

app.use("/api/auth", authRouter);

app.listen(process.env.API_PORT || 5000, () => {
  logger.info(`API server started on port ${process.env.API_PORT || 5000}`);
});
