import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userContractAddress: { type: String, required: true, unique: true },
    ethAccountAddress: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isDishonest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
