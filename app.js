// Create app
// http://stackoverflow.com/questions/5710358/how-to-retrieve-post-query-parameters-in-express
var config = require('./config');
var express = require('express');
var bodyParser = require('body-parser');
var cacheManifest = require('connect-cache-manifest')
var app = express()

// Enable URL-encoded bodies (optional)
.use(bodyParser.urlencoded({extended: true, limit: '50mb'}))

// Enable JSON-encoded bodies (optional)
.use(bodyParser.json({limit: '50mb'}))

// Enable gzip
.use(require('compression')())

// Enable cookie
.use(require('cookie-parser')())

// Enable cookie-session
.use(require('cookie-session')(({ secret: 'Secret!!', cookie: { maxAge: 60 * 60 * 1000 }})))

// Enable apache-style access log
.use(require('morgan')(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'))

// Include user module
.use('/', require('./routes/index'))
.use('/car', require('./routes/car'))
//新模組請加在這裏

// Serve static files
.use('/', express.static('public'))
.use('/', express.static(config.images))

// Manage cache.manifest
.use(cacheManifest({
  manifestPath: '/cache.manifest',
  files: [{
    dir: __dirname + '/public',
    prefix: '/'
  }],
  networks: ['*'],
  fallbacks: []
}))


// Handle error message
.use((err, req, res, next) => res.send({error: 1, message: err.message}));

module.exports = app;
