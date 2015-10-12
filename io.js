// Create server
var app = require('./app');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// IOs
io.on('connection', socket => {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', data => {
    console.log(data);
  });
});

module.exports = server;
