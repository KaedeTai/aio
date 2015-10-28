// Create server
var app = require('./app');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var rooms = {102: {name: 'room1-2', male: 1, female: 2}, 103: {name: 'room1-3', male: 1, female: 3}, 203: {name: 'room2-3', male: 2, female: 3}};
var user_rooms = {1: [102, 103], 2: [102, 203], 3: [103, 203]};
var tokens = {'token1': 1, 'token2': 2, 'token3': 3};
var users = {1: 'user1', 2: 'user2', 3: 'user3'};
var sockets = {};

// Chatroom
io.on('connection', socket => {
  // Say hello when connected
  socket.emit('hello', 'world');

  // User login
  socket.on('login', token => {
    // Save user_id in socket
    var user_id = tokens[token];
    sockets[user_id] = socket;
    socket.user_id = user_id;

    // Get user rooms
    var my_rooms = [];
    var mr = user_rooms[user_id];
    for (var i = 0; i < mr.length; i ++) {
      var room_id = mr[i];
      var r = rooms[room_id];
      var u = (r.male == user_id)? r.female: r.male;
      my_rooms.push({room_id: room_id, name: r.name, user: users[u]});
    }
    socket.emit('rooms', my_rooms);
  });

  // Get a message
  socket.on('msg', (room_id, msg) => {
    var user_id = socket.user_id;
    var r = rooms[room_id];
    var u = (r.male == user_id)? r.female: r.male;
    console.log(room_id, msg, u);
    var s = sockets[u];
    
    s.emit('msg', room_id, msg);
  });
});

module.exports = server;
