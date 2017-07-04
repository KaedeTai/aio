// Create app
var api = require('../api')('/');
var config = require('../config');
var Mongo = require('../utils/Mongo');
var FS = require('../utils/FS');
var Exec = require('../utils/Exec');
var randomstring = require("randomstring");


// Include models


// Admin UI example

api.get('/admin_shop', (req, res) => {
  res.render({shop: Mongo.one('shop', {id: 0}, {_id: 0})}, 'public/admin_shop.html');
});

api.post('/admin_shop_upload', (req, res) => {
  var file = req.files.file;
  var src = randomstring.generate(6) + file.name.match(/(\.[^.]+)$/)[1];
  if (/^video/.test(file.type))
    Exec(config.ffmpeg + ' -i ' + file.path + ' -ss 00:00:01.000 -vframes 1 ' + config.images + '/' + src + '.png');
  FS.rename(file.path, config.images + '/' + src);
  res.ok({src, type: file.type, name: file.name, intro: ''});
});

api.post('/admin_shop_save', (req, res) => {
  res.ok(Mongo.update('shop', {id: req.body.id}, req.body));
});

api.get('/admin_contact', (req, res) => {
  res.render({contact: Mongo('contact', {id: 0}, {_id: 0})[0]}, 'public/admin_contact.html');
});

api.post('/admin_contact_save', (req, res) => {
  res.ok(Mongo.update('contact', {id: req.body.id}, req.body));
});


// Mongo範例

api.get('/add', (req, res) => {
  res.ok(Mongo.add('test', {name: req.query.name}));
});

api.get('/get', (req, res) => {
  res.ok(Mongo.get('test', req.query._id));
});

api.get('/set', (req, res) => {
  res.ok(Mongo.set('test', req.query._id, {name: req.query.name}));
});

api.get('/del', (req, res) => {
  res.ok(Mongo.del('test', req.query._id));
});


module.exports = api;
