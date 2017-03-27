var DB = require('../utils/DB');

//可以不換行，DB.one('xxx') 跟 DB('xxx')[0] 是一樣的意思，只取第一筆
Car = (id) => DB.select('car', {id: id});

Car.getAllInfo = (id, gender) => DB(`
SELECT a.aaa, b.bbb, c.ccc
  FROM aa a, bb b, cc ca
 WHERE a.bb_id = b.id
   AND b.cc_id = c.id
   AND b.id = :id
   AND c.id = :id
   AND c.gender = :gender
`, {id, gender});

//也可以換行，下 INSERT/UPDATE/DELETE 只能用 DB('xxx') 不能用 DB.one('xxx')
Car.delete = (id) => DB(`
DELETE
  FROM car
 WHERE id=?
`, [id]);

module.exports = Car;
