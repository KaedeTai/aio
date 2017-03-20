// Create app
var api = require('../api')('/car');
var config = require('../config');
var moment = require('moment');

// Include models
var Car = require('../models/Car');

api.unit('/get', {car_id: 1});
api.get('/get', {car_id: 'int'}, (req, res) => {
  res.ok(Car(req.query.car_id));
});

api.unit('/delete', {car_id: 1});
api.get('/delete', {car_id: 'int'}, (req, res) => {
  res.ok(Car.delete(req.query.car_id));
});

api.help('/help');
api.test('/test');

module.exports = api;
