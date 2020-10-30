Project Management Web Application Built Using Next.js, MongoDB, Websockets, and Node + Express

All React Components are stored in /Components. The layout that is shared between all pages is also found here.

MongoDB Mongoose models can be found in /Models. Models include: \
Ticket - The schema for tickets which include   title: String,\
  ticketID: Number,\
  submitterID: String,\
  timeStamp: String,\
  projectID: String,\
  projectName: String,\
  urgency: String,\
  description: String,\
  status: String,\
  comments: [String],\
  commentsUserWhoPosted: [String]\
  
Project - \
  projectName: String,\
  description: String,\
  dateCreated: String,\
  admins: [String], //List of User IDs of the Admins\
  adminIDs: [String],\
  users: [String], //Includes the Admins as well\
  userIDs: [String],\
  currentTicketNumber: Number\
  
User - \
  projects: [String],\
  userID: String,\
  name: String\
