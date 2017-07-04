// Create app
var api = require('../api')('/car');
var config = require('../config');
var moment = require('moment');
var DB = require('../utils/DB');

// Include models
var Car = require('../models/Car');

api.get('/tables', {}, (req, res) => {
  res.ok(DB.tables());
});

api.get('/explain/:table', {}, (req, res) => {
  res.ok(DB.explain(req.params.table));
});

api.unit('/all', {});
api.get('/all', {}, (req, res) => {
  res.ok(Car.getAllInfo());
});

api.unit('/new', {});
api.unit('/new', {name: 'test'});
api.unit('/new', {name: 'test', brand_id: 3});
api.unit('/new', {name: 'test', brand_id: 1});

api.get('/new', {name: /.+/, brand_id: [1, 2]}, (req, res) => {
  res.ok(DB.insert('car', req.query));
});

api.unit('/get', {id: 1});
api.get('/get', {id: 'int'}, (req, res) => {
  var car = Car(req.query.id);
  if (!car)
    return res.err(1, '找不到這台車');
  res.ok(car);
});

api.unit('/delete', {id: 1});
api.get('/delete', {id: 'int'}, (req, res) => {
  res.ok(Car.delete(req.query.id));
});

var Chrome = require('../utils/Chrome');

api.get('/init', {}, (req, res) => {
  Chrome('http://trader.tozzi.com.tw/trader/5');
  res.ok();
});

api.get('/a', {}, (req, res) => {
  var total = Chrome.eval("$('.slick-slide a').length").result.value;
  var a = [];
  for (var i = 0; i < total; i ++) {
    a.push(Chrome.eval("$('.slick-slide a')[" + i + "].href").result.value);
  }
  Chrome.eval("$('.slick-slide a')[0].click()")
  res.ok(a);
});

api.get('/', {}, (req, res) => {
  res.render({cars: Car.getAllInfo()}, 'public/car.html');
});

api.post('/', {}, (req, res) => {
  res.ok(req.body);
});

api.help('/help');
api.test('/test');

module.exports = api;
