// Create server
var app = require('./app');
var config = require('./config');
var fs = require('fs');
var server;
if (config.https)
  server = require('https').createServer({
    key: fs.readFileSync(config.ssl_key),
    cert: fs.readFileSync(config.ssl_cert)
  }, app);
else
  server = require('http').createServer(app);
var io = require('socket.io')(server);

// Socket.io services here

module.exports = server;
