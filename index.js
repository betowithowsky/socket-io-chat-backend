const { server, io } = require("./config/server");

const routeChatRealTime = require('./app/routes/chatRealTime')
routeChatRealTime(io)

server.listen(8090, () => {
  console.log("online");
});
