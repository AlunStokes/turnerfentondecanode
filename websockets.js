var app = require('express')();
var fs = require("fs")
var config = require("./config");


var sslKey = null;
try {
  sslKey = fs.readFileSync(config.sslKey);
} catch (e) {

}

if (sslKey) {
    var options = {
      key: fs.readFileSync(config.sslKey),
      cert: fs.readFileSync(config.sskCertificate)
    };

  var https = require('https');

  var server = https.createServer(options, app);
  var io = require('socket.io')(server);

  server.listen(9000, function(){
    console.log('listening on *:9000 with ssl');
  });
}
else {
  var http = require('http').Server(app);
  var io = require('socket.io')(http);

  http.listen(9000, function(){
    console.log('listening on *:9000');
  });
}

var usersOnline = 0;

//Each session in sessions is an object containing studentNumber, and an array of all socket ids (multiple tabs) belonging to it
var sessions = [

];

var examWriters = [];

io.on('connection', function(socket){
  socket.on('identifyUser', function(data) {
    newConnection(socket, data.studentNumber);
  });

  socket.on('disconnect', function() {
    droppedConnection(socket);
  });

  //Check exam writers
  socket.on('writingExam', function(studentNumber) {
    addExamWriter(studentNumber);
  });

  socket.on('stillWritingExam', function(studentNumber) {
    retainExamWriter(studentNumber);
  });

  socket.on('checkWritingExam', function(studentNumber, callback) {
    if (typeof(examWriters[examWriters.map(function(e) {return e.studentNumber}).indexOf(studentNumber)]) != "undefined" && examWriters[examWriters.map(function(e) {return e.studentNumber}).indexOf(studentNumber)] != -1) {
      callback(true);
    }
    else {
      callback(false);
    }
  });
});

//Check in on exam writers
setInterval(function() {
  var now = Date.now();
  for (var i = 0; i < examWriters.length; i++) {
    if (now - examWriters[i].lastCheckIn > 65000) {
      examWriters.splice(i , 1);
    }
  }
  return;
}, 70000);

function addExamWriter(studentNumber) {
  examWriters.push({
    studentNumber: studentNumber,
    lastCheckIn: Date.now()
  });
  return;
}

function retainExamWriter(studentNumber) {
  //Find object in examWriters array with studentNumber value of parameter studentNumber
  var index = examWriters.map(function(e) {return e.studentNumber}).indexOf(studentNumber);
  if (index != -1 && typeof(index) != "undefined") {
    examWriters[index].lastCheckIn = Date.now();
  }
}

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
  if (typeof(userIndex) != "undefined") {
    sessions[userIndex].socketids.push(socket.id);
    //Tell only this socket num users online
    socket.emit('usersOnline', {usersOnline: usersOnline});
    return;
  }
  //If new user
  sessions.push({
    studentNumber: studentNumber,
    socketids: [
      socket.id
    ]
  });
  usersOnline++;
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
    usersOnline--;
    usersOnlineChange();
    return;
  }
  //if user disconnects before submitting student number
  return;
}

function usersOnlineChange() {
  //Update all clients
  io.emit('usersOnline', {usersOnline: usersOnline});
}
