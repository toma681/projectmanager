import auth0 from "../../utils/auth0.js";
import project from "../../models/project.js";
import dbConnect from "../../utils/dbConnect";
import users from "../../models/users";

export default auth0.requireAuthentication(async (req, res) => {
  // Method of Request
  const { method } = req;
  const { options } = req.query;
  //Connecting to DB
  await dbConnect();

  //User which is making Request
  const { user } = await auth0.getSession(req);

  const userID = user.sub;

  switch (method) {
    case "GET" /* Get all of your own Tickets */:
      try {
        let foundProjects;
        if (options === "all") {
          foundProjects = [];

          const grabUserProjects = async (resolve, reject) => {
            const foundUser = await users.findOne({ userID: user.sub }).lean();

            const userProjects = foundUser.projects;

            for (let x = 0; x < userProjects.length; x++) {
              const foundProject = await project
                .findOne({ _id: userProjects[x] })
                .lean();
              foundProjects.push(foundProject);
            }
            resolve();
          };
          const grabUserProjectsPromise = new Promise(grabUserProjects);
          await grabUserProjectsPromise.then(() => {
            res.statusCode = 200;
            res.json(foundProjects);
          });

          return;
        } else if (options === "getprojectbyid") {
          foundProjects = await project
            .findOne({ _id: req.query.projectid })
            .lean();
        }
        res.statusCode = 200;
        res.json(foundProjects || { msg: "empty" });
      } catch (err) {
        res.statusCode = 500;
        res.json({ msg: "Something went wrong" });
      }
      break;

    case "POST" /* Insert new Document */:
      try {
        const { projectName, description } = req.body;

        const curDate = new Date().toString();

        let newProject = await project.create({
          projectName,
          description,
          dateCreated: curDate,
          admins: [user.name],
          adminIDs: [userID],
          users: [],
          userIDs: [],
          currentTicketNumber: 0,
        });

        let foundUser = await users.findOne({ userID }).lean();
        foundUser.projects.push(newProject._id);

        await users.updateOne({ userID }, { ...foundUser });

        res.statusCode = 200;
        res.json(newProject);
      } catch (err) {
        res.statusCode = 500;
        res.json({ msg: "Something went wrong" });
      }
      break;

    case "PUT" /* Edit a document */:
      const data = req.body;
      try {
        let newProject;
        if (options === "addUser") {
          const foundUser = await users
            .findOne({ userID: data.newUserID })
            .lean();

          foundUser.projects.forEach((proj) => {
            if (proj === data._id) {
              throw "User Already Added!";
            }
          });

          const userName = foundUser.name;
          let foundProject = await project.findOne({ _id: data._id }).lean();
          const newProjectList = [...foundUser.projects, foundProject._id];
          await users.updateOne(
            { userID: data.newUserID },
            { projects: newProjectList }
          );
          await foundProject.users.push(userName);
          await foundProject.userIDs.push(data.newUserID);
          await project.updateOne({ _id: data._id }, { ...foundProject });
          newProject = { userName };
        } else if (options === "delUser") {
          const foundUser = await users.findOne({ userID: data.myID }).lean();
          const projectIndex = foundUser.projects.find(
            (proj) => proj === data._id
          );
          foundUser.projects.splice(projectIndex, 1);
          await users.updateOne(
            { userID: data.myID },
            { projects: foundUser.projects }
          );

          delete data.myID;

          newProject = await project.updateOne({ _id: data._id }, { ...data });
        } else {
          newProject = await project.updateOne({ _id: data._id }, { ...data });
        }
        res.statusCode = 200;
        res.json(newProject);
      } catch (err) {
        res.statusCode = 500;
        res.json({ msg: "Something went wrong" });
      }
      break;

    case "DELETE" /* Delete a document */:
      try {
      } catch (err) {}
      break;
  }
});
