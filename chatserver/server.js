const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

let rooms = new Map();

app.get("/", (req, res) => {
  res.send("Chat Server for Tracker");
});

io.on("connection", (socket) => {
  console.log(`New connection from ${socket.id}!`);

  socket.on("joinRoom", (projectID) => {
    socket.join(projectID);

    let curRoom = rooms.get(projectID);

    if (!curRoom) {
      rooms.set(projectID, {
        messageList: [],
      });
    }

    io.to(socket.id).emit(
      "receivePrevMessages",
      curRoom ? curRoom.messageList : rooms.get(projectID).messageList
    );
  });

  socket.on("sendMessage", (msg) => {
    const projectID = msg.projectID;

    rooms.get(projectID).messageList.push(msg);

    io.to(projectID).emit("receiveMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} has disconnected!`);
  });
});

server.listen(process.env.PORT || 8080, () => console.log("Server Running"));
