var DB = require('../utils/DB');
var util = require('util');

//可以不換行，DB.one('xxx') 跟 DB('xxx')[0] 是一樣的意思，只取第一筆
Car = (id) => DB.one(`SELECT * FROM car WHERE id=:id`, {id});

//也可以換行，下 INSERT/UPDATE/DELETE 只能用 DB('xxx') 不能用 DB.one('xxx')
Car.delete = (id) => DB(`
DELETE
  FROM car
 WHERE id=:id
`, {id});

module.exports = Car;
