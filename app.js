// Create app
var express = require('express');
var bodyParser = require('body-parser');
var app = express()

// Enable encoded URL (optional)
//.use(bodyParser.urlencoded({extended: true}))

// Enable JSON (optional)
//.use(bodyParser.json())

// Enable gzip
//.use(require('compression')())

// Enable cookie
//.use(require('cookie-parser')())

// Enable cookie-session
//.use(require('cookie-session')(({ secret: 'Secret!!', cookie: { maxAge: 60 * 60 * 1000 }})))

// Include user module
.use('/user', require('./routes/user'))

// Serve static files
.use('/', express.static('public'))

// Handle error message
.use((err, req, res, next) => res.send({error: 1, message: err.message}));

module.exports = app;
