var promise = require('bluebird')
var mongo = promise.promisifyAll(require('mongodb').MongoClient);
var await = require('asyncawait/await');
var config = require('../config');

var db;

var Mongo = (collection, find, fields, sort) => {
  if (!db) db = await(mongo.connectAsync(config.mongodb));
  var cursor = await(db.collection(collection).find(find, fields).sort(sort));
  var arr = [];
  var next = promise.promisifyAll(cursor);
  while (item = await(cursor.nextAsync())) {
    arr.push(item);
  }
  return arr;
}

Mongo.insert = (collection, insert) => {
  if (!db) db = await(mongo.connectAsync(config.mongodb));
  return await(db.collection(collection).insertOne(insert));
}

Mongo.update = (collection, update, set) => {
  if (!db) db = await(mongo.connectAsync(config.mongodb));
  return await(db.collection(collection).updateOne(update, {$set: set}));
}

Mongo.remove = (collection, remove) => {
  if (!db) db = await(mongo.connectAsync(config.mongodb));
  return await(db.collection(collection).removeOne(remove));
}

module.exports = Mongo;
