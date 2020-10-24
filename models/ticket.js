import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  //ticketID, submitterID, timeStamp, projectName, urgency, description
  title: String,
  ticketID: Number,
  submitterID: String,
  timeStamp: String,
  projectID: String,
  projectName: String,
  urgency: String,
  description: String,
  status: String,
  comments: [String],
  commentsUserWhoPosted: [String]
});

export default mongoose.models?.Ticket ||
  mongoose.model("Ticket", ticketSchema);
