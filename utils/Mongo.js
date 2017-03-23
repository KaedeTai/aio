var promise = require('bluebird')
var mongo = promise.promisifyAll(require('mongodb').MongoClient);
var await = require('asyncawait/await');
var config = require('../config');

var db;

var Mongo = (collection, find) => {
  if (!db) db = await(mongo.connectAsync(config.mongodb));
  var cursor = await(db.collection(collection).find(find));
  var arr = [];
  var next = promise.promisifyAll(cursor);
  while (item = await(cursor.nextAsync())) {
    arr.push(item);
  }
  return arr;
}

module.exports = Mongo;
