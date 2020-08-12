var server = require('./server');
var sio = require('socket.io')(server);

// Socket.io services here
sio.on('connection', socket => {
  socket.on('hi', msg => {
    console.log(msg);
    sio.emit('hi', msg);
  })
})

module.exports = sio;
