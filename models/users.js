import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  projects: [String],
  userID: String,
  name: String
});

export default mongoose.models?.User || mongoose.model("User", userSchema);
