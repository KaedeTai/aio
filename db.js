var db = require('mysql-promise')();

db.configure({
  'host': 'localhost',
  'user': 'root',
  'password': '',
  'database': 'test'
});

module.exports = db;
