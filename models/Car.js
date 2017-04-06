var DB = require('../utils/DB');

//可以不換行，DB.one('xxx') 跟 DB('xxx')[0] 是一樣的意思，只取第一筆
Car = (id) => DB.one('SELECT * FROM car WHERE id=?', [id]);

//也可以換行，下 INSERT/UPDATE/DELETE 只能用 DB('xxx') 不能用 DB.one('xxx')
Car.delete = (id) => DB(`
DELETE
  FROM car
 WHERE id=?
`, [id]);

//取得所有車輛資訊
Car.getAllInfo = () => DB(`
SELECT c.id, c.name, b.name AS brand
  FROM car c, brand b
 WHERE c.brand_id = b.id
`);

module.exports = Car;
