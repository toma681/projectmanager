import auth0 from "../../utils/auth0.js";
import ticket from "../../models/ticket.js";
import dbConnect from "../../utils/dbConnect";
import project from "../../models/project.js";

export default auth0.requireAuthentication(async (req, res) => {
  const { method } = req;
  const { options } = req.query;
  const { user } = await auth0.getSession(req);
  const userID = user.sub;
  await dbConnect();
  
  switch (method) {
    case "GET":
      try {
        let foundTickets;
        if (options === "all") {
          foundTickets = await ticket.find({ submitterID: userID });
        } else if (options === "ticketbyid") {
          foundTickets = await ticket.findOne({
            _id: req.query.ticketid,
          });
        } else if (options === "getprojecttickets") {
          foundTickets = await ticket.find({ projectID: req.query.projectid });
        }

        res.statusCode = 200;
        res.json(foundTickets);
      } catch (err) {
        res.statusCode = 500;
        res.json({ msg: "Something went wrong" });
      }
      break;

    case "POST" /* Insert new Document */:
      try {
        const { projectID, urgency, description, title } = req.body;
        const timeStamp = new Date().toString();

        let foundProject = await project.findOne({ _id: projectID }).lean();
        const ticketID = foundProject.currentTicketNumber;
        await project.updateOne(
          { _id: projectID },
          { currentTicketNumber: foundProject.currentTicketNumber + 1 }
        );

        let newTicket = await ticket.create({
          title,
          ticketID,
          submitterID: userID,
          timeStamp,
          projectID,
          urgency,
          description,
          projectName: foundProject.projectName,
          status: "Open",
          comments: [],
          commentsUserWhoPosted: [],
        });

        res.statusCode = 200;
        res.json(newTicket);
      } catch (err) {
        res.statusCode = 500;
        res.json({ msg: "Something went wrong" });
      }
      break;

    case "PUT" /* Edit a document */:
      try {
        const data = req.body;

        const foundTicket = await ticket.findOne({ _id: data._id }).lean();

        const newTicket = await ticket.updateOne(
          { _id: data._id },
          {
            ...foundTicket,
            ...data,
          }
        );

        res.statusCode = 200;
        res.json(newTicket);

        // await ticket.find({ticketID: data.ticketID, submitterID: })
      } catch (err) {
        res.statusCode = 500;
        res.json({ msg: "Something went wrong" });
      }
      break;

    case "DELETE" /* Delete a document */:
      try {
        const { ticketID } = req.body;

        const deletedTicket = ticket.deleteOne({ ticketID });
        res.statusCode = 200;
        res.json(deletedTicket);
      } catch (err) {
        res.statusCode = 500;
        res.json({ msg: "Something went wrong" });
      }
      break;
  }
});

export async function serverSideTickets(userID) {
  await dbConnect();
  const result = await ticket.find({ submitterID: userID }).lean();

  result.map(doc => {
    const ticket = doc;
    ticket._id = ticket._id.toString()
  });

  return result;
}
