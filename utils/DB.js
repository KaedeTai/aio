var db = require('mysql-promise')();

db.configure({
  'host': 'localhost',
  'user': 'root',
  'password': '',
  'database': 'test'
});

var DB = (sql, params) => db.query(sql, params).spread(rs => rs).catch(err => err);
DB.one = (sql, params) => DB(sql, params).then(rows => rows[0]);

module.exports = DB;
