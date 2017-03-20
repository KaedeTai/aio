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

DB.tables = () => DB('SHOW TABLES');

DB.explain = (table) => DB('EXPLAIN ' + DB.quote(table));

DB.select = (table, fields) => {
  if (!fields) fields = '*';
  return DB('SELECT ' + fields + ' FROM ' + DB.quote(table));
}

DB.insert = (table, values) => {
  var keys = [];
  var vars = [];
  var vals = [];
  for (k in values) {
    keys.push(DB.quote(k));
    vars.push('?');
    vals.push(values[k]);
  }
  var sql = 'INSERT INTO ' + DB.quote(table) + ' (' + keys.join(',') + ') VALUES (' + vars.join(',') + ')';
  return DB(sql, vals);
};

DB.replace = (table, values) => {
  var keys = [];
  var vars = [];
  var vals = [];
  for (k in values) {
    keys.push(DB.quote(k));
    vars.push('?');
    vals.push(values[k]);
  }
  var sql = 'REPLACE INTO ' + DB.quote(table) + ' (' + keys.join(',') + ') VALUES (' + vars.join(',') + ')';
  return DB(sql, vals);
};

DB.delete = (table, values) => {
  var keys = [];
  var vars = [];
  var vals = [];
  for (k in values) {
    vars.push(DB.quote(k) + '=?');
    vals.push(values[k]);
  }
  var sql = 'DELETE FROM ' + DB.quote(table) + ' WHERE ' + vars.join(' AND ');
  return DB(sql, vals);
};

module.exports = DB;
