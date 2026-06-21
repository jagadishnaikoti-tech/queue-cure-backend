const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let queue = [];
let currentToken = null;
let averageTime = 10;

io.on("connection", (socket) => {
  console.log("Client Connected");

  socket.emit("queueData", {
    queue,
    currentToken,
    averageTime,
  });

  socket.on("addPatient", (patientName) => {
    console.log("Patient received:", patientName);
    const token = queue.length + 1;

    queue.push({
      token,
      name: patientName,
    });

    console.log("Current Queue:", queue);

    io.emit("queueData", {
      queue,
      currentToken,
      averageTime,
    });
  });

  socket.on("callNext", () => {
    if (queue.length > 0) {
      currentToken = queue.shift();

      io.emit("queueData", {
        queue,
        currentToken,
        averageTime,
      });
    }
  });

  socket.on("setAverageTime", (time) => {
    averageTime = time;

    io.emit("queueData", {
      queue,
      currentToken,
      averageTime,
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});