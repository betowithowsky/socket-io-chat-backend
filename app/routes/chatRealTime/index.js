module.exports = function (io) {
  var sockets = {};
  var userCounts = 0;

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    //socket.broadcast.emit('a user connected');

    socket.on("user:login", function (data) {
      var userId = ++userCounts;
      socket.user = {
        userId: userId,
        username: data.name ? data.name : "User " + userId,
        nickname: data.name ? data.name : "user" + userId,
      };
      socket.emit("response", { type: "user:login", data: socket.user });
      Object.keys(sockets).map(function (userId) {
        sockets[userId].emit("response", {
          type: "user:added",
          data: socket.user,
        });
      });
      sockets[userId] = socket;
    });

    socket.on("user:logout", function () {
      var user = socket.user;
      if (!user) return;
      delete sockets[user.userId];
      socket.broadcast.emit("response", {type: "user:removed", data: user});
      socket.disconnect(true);
    });

    socket.on("message:send", function (message) {
      console.log("response_message:send: ", message);
      message.time = new Date().getTime();

      //SEND_MESSAGE_TO_THIS_SOCKET
      socket.emit("response", { type: "message:sendAll", data: message });

      //SEND_MESSAGE_TO_ESPECIFIQUE_OR_OTHER_ALL_SOCKETS
      sockets[message.to]
        ? sockets[message.to].emit("response", {
            type: "message:new",
            data: message,
          })
        : socket.broadcast.emit("response", {
            type: "message:sendAll",
            data: message,
          });
    });

    socket.on("isTyping", () => {
      console.log("isTyping");
    });

    socket.on("users:get", function () {
      var data = Object.keys(sockets)
      .map(function (userId) {
        var user = sockets[userId].user;
        return {
          userId: user.userId,
          username: user.username,
          nickname: user.nickname,
          unreadMessageCount: 0,
          messages: [],
        };
      })
      .filter(function (user) {
        if (user.userId === socket.user.userId) return false;
        
        if (data && data.target && data.targetId !== user.userId)
        return false;
        
        return true;
      });
      socket.emit("response", { type: "users:get", data });
    });
  });
};
