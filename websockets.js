var app = require("./app");
var socketio = require('socket.io');
var io = socketio();
var ws = {

}

ws.io = io;

app.locals.usersOnline = 0;

//Each session in sessions is an object containing studentNumber, and an array of all socket ids (multiple tabs) belonging to it
var sessions = [

];

io.on('connection', function(socket){

    socket.on('identifyUser', function(data) {
      newConnection(socket, data.studentNumber);
    });

    socket.on('disconnect', function() {
      droppedConnection(socket);
    })
});

function newConnection(socket, studentNumber) {
  //Index of user with given studentNumber in sessions array
  var userIndex;
  //Looks through each entry, sets userIndex if user with studentNumber found
  for (var i = 0; i < sessions.length; i++) {
    if (sessions[i].studentNumber == studentNumber) {
      userIndex = i;
      break;
    }
  }
  //If user already in array
  if (typeof(userIndex) != 'undefined') {
    sessions[userIndex].socketids.push(socket.id);
    //Tell only this socket num users online
    socket.emit('usersOnline', {usersOnline: app.locals.usersOnline});
    return;
  }
  //If new user
  sessions.push({
    studentNumber: studentNumber,
    socketids: [
      socket.id
    ]
  });
  app.locals.usersOnline++;
  usersOnlineChange();
  return;
}

function droppedConnection(socket) {
  //Index of user with socket id in array
  var userIndex;
  //Index of socketid in socket id array
  var socketIndex;
  //Number of sockets left for user once current socket removed
  var remainingSockets;
  //Looks through session id array in each entry of sessions for socketid
  for (var i = 0; i < sessions.length; i++) {
    for (var j = 0; j < sessions[i].socketids.length; j++) {
      if (sessions[i].socketids[j] == socket.id) {
        userIndex = i;
        socketIndex = j;
        remainingSockets = sessions[i].socketids.length - 1;
        break;
      }
    }
  }
  //If user has entry
  if (typeof(userIndex) != 'undefined') {
    //If user has other pages open
    if (remainingSockets > 0) {
      sessions[userIndex].socketids.splice(socketIndex, 1);
      return;
    }
    //If user's last page is being closed
    sessions.splice(userIndex, 1);
    app.locals.usersOnline--;
    usersOnlineChange();
    return;
  }
  //if user disconnects before submitting student number
  return;
}

function usersOnlineChange() {
  //Update all clients
  io.emit('usersOnline', {usersOnline: app.locals.usersOnline});
}

/*
ws.sendNotification = function() {
    io.sockets.emit('hello', {msg: 'Hello World!'});
}
*/

module.exports = ws;
