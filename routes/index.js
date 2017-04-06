// Create app
var api = require('../api')('/');

// Include models
var Car = require('../models/Car');

api.get('/', {}, (req, res) => {
  res.render({cars: Car.getAllInfo()}, 'public/index.html');
});

module.exports = api;
