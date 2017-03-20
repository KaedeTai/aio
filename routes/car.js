// Create app
var api = require('../api')('/car');
var config = require('../config');
var moment = require('moment');
var DB = require('../utils/DB');

// Include models
var Car = require('../models/Car');

api.unit('/new', {name: 'test'});
api.get('/new', {name: /.+/, brand_id: [1, 2]}, (req, res) => {
  res.ok(DB.insert('car', {name: req.query.name, brand_id: req.query.brand_id}));
});

api.unit('/get', {id: 1});
api.get('/get', {id: 'int'}, (req, res) => {
  res.ok(Car(req.query.id));
});

api.unit('/delete', {id: 1});
api.get('/delete', {id: 'int'}, (req, res) => {
  res.ok(Car.delete(req.query.id));
});

api.help('/help');
api.test('/test');

module.exports = api;
