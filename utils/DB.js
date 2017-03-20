var db = require('mysql-promise')();
var await = require('asyncawait/await');
var config = require('../config');

db.configure({
  'host': config.hostname,
  'user': config.username,
  'password': config.password,
  'database': config.database
});

var DB = (sql, params) => await(db.query(sql, params).spread(rs => rs));
DB.one = (sql, params) => DB(sql, params)[0];
DB.quote = (table) => '`' + table.replace(/`/g, '') + '`';

module.exports = DB;
