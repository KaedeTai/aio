var config = require('../config');
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
oracledb.autoCommit = true;
oracledb.poolMax = 4;
oracledb.maxRows = 10000;
var credentials = {
  user: config.username,
  password: config.password,
  connectString: config.database,
};

Date.prototype.addHours= function(h) {
  this.setHours(this.getHours()+h);
  return this;
}

var pool;

var Oracle = (sql, params) => {
  oracledb.autoCommit = true;
  if (!pool) pool = await(oracledb.createPool(credentials));
  var conn = await(pool.getConnection());
  try {
    var rs = await(params? conn.execute(sql, params): conn.execute(sql));
  }
  catch (err) {
    conn.close();
    throw err + ':' + sql;
  }
  conn.close();

  return rs.rows? rs.rows.map(item => {
    for (var key in item) {
      //if (item[key] instanceof Date)
      //  item[key] = item[key].addHours(-8); //這是個hack，以後要改掉
      var lower = key.toLowerCase();
      if (lower !== key) { 
        item[lower] = item[key];
        delete item[key];
      }
    }
    return item;
  }): rs.rowsAffected;
};

Oracle.one = (sql, params) => Oracle(sql, params)[0];

// cmds 就是 cmd 的 array，每個cmd都是 [sql, params]
Oracle.all = (cmds) => {
  oracledb.autoCommit = false;
  if (!pool) pool = await(oracledb.createPool(credentials));
  var conn = await(pool.getConnection());
  var affected = [];
  for (var i in cmds) {
    [sql, params] = cmds[i];
    if (i == cmds.length - 1) {
      oracledb.autoCommit = true;
      affected.push(await(params? conn.execute(sql, params): conn.execute(sql)).rowsAffected);
      conn.close();
      return affected;
    }
    affected.push(await(params? conn.execute(sql, params): conn.execute(sql)).rowsAffected);
  }
}

module.exports = Oracle;
