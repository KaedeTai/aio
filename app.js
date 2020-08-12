// Create app
// http://stackoverflow.com/questions/5710358/how-to-retrieve-post-query-parameters-in-express
var config = require('./config');
var express = require('express');
var cors = require('cors');
var multiparty = require('connect-multiparty');
var bodyParser = require('body-parser');
var cacheManifest = require('connect-cache-manifest')
var app = express()

// Enable CORS
.use(cors({
  origin: 'https://domain.name',
  optionsSuccessStatus: 200,
}))

// Enable URL-encoded bodies (optional)
.use(bodyParser.urlencoded({extended: true, limit: '50mb'}))

// Enable JSON-encoded bodies (optional)
.use(bodyParser.json({limit: '50mb'}))

// Enable upload
.use(multiparty({uploadDir: '/tmp'}))

// Enable CORS
.use(require('cors')())

// Enable gzip
.use(require('compression')())

// Enable cookie
.use(require('cookie-parser')('This is a secret!'))

// Enable cookie-session
.use(require('cookie-session')(({
  domain: process.env.COOKIE_HOST,
  secret: 'Secret!!',
  cookie: { maxAge: 60 * 60 * 1000 }
})))

// Enable trust proxy and only trust loopback - 127.0.0.1/8, ::1/128
.set('trust proxy', 'loopback')

// Enable apache-style access log
.use(require('morgan')('combined', {
  skip: (req, res) =>
    ['::ffff:127.0.0.1', '127.0.0.1'].includes(req.ip)
    && ['/website/exr', '/checkSheet'].includes(req.originalUrl)
    || ['/ping'].includes(req.originalUrl)
}))

// Include user module
.use('/', require('./routes/index'))
//新模組請加在這裏
//.use('/test', require('./routes/test'))

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
.use((err, req, res, next) => res.send({error: 1, message: err.message}))
.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'))
.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
.use('/vue', express.static(__dirname + '/node_modules/vue/dist'));

module.exports = app;
