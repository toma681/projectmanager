import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  //Name, Users, Description, Creation Date, Admins
  projectName: String,
  description: String,
  dateCreated: String,
  admins: [String], //List of User IDs of the Admins
  adminIDs: [String],
  users: [String], //Includes the Admins as well
  userIDs: [String],
  currentTicketNumber: Number
});

export default mongoose.models?.Project ||
  mongoose.model("Project", projectSchema);
