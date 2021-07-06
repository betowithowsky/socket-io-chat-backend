const app = require('express')();
const server = require('http').createServer(app)

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

module.exports = {server, io};

