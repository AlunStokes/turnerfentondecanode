var socket = io.connect('http://localhost:3000');

socket.on("connect", function() {
  socket.emit("identifyUser", {studentNumber: studentNumber});
});
