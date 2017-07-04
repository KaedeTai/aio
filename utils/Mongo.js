var promise = require('bluebird')
var mongo = promise.promisifyAll(require('mongodb').MongoClient);
var await = require('asyncawait/await');
var config = require('../config');

var db;

var Mongo = (collection, find, fields, sort) => {
  if (!db) db = await(mongo.connectAsync(config.mongodb));
  var cursor = await(db.collection(collection).find(find, fields).sort(sort));
  var arr = [];
  promise.promisifyAll(cursor);
  while (item = await(cursor.nextAsync())) {
    arr.push(item);
  }
  return arr;
}

Mongo.one = (collection, find, fields, sort) => {
  if (!db) db = await(mongo.connectAsync(config.mongodb));
  var cursor = await(db.collection(collection).find(find, fields).sort(sort).limit(1));
  var arr = [];
  promise.promisifyAll(cursor);
  if (item = await(cursor.nextAsync())) {
    return item;
  }
  return null;
}

Mongo.insert = (collection, insert) => {
  if (!db) db = await(mongo.connectAsync(config.mongodb));
  var rs = await(db.collection(collection).insert(insert));
  return {inserted: rs.insertedCount, _ids: rs.insertedIds};
}

Mongo.insertOne = (collection, one) => {
  if (!db) db = await(mongo.connectAsync(config.mongodb));
  var rs = await(db.collection(collection).insertOne(one));
  return {inserted: rs.insertedCount, _id: rs.insertedId};
}

Mongo.update = (collection, update, set) => {
  if (!db) db = await(mongo.connectAsync(config.mongodb));
  var rs = await(db.collection(collection).updateOne(update, {$set: set}));
  return {matched: rs.matchedCount, updated: rs.modifiedCount};
}

Mongo.remove = (collection, remove) => {
  if (!db) db = await(mongo.connectAsync(config.mongodb));
  var rs = await(db.collection(collection).removeOne(remove));
  return {removed: rs.deletedCount};
}

// manage by auto increment _id

Mongo._id = (collection) => {
  var last = Mongo.one(collection, {}, {_id: 1}, {_id: -1});
  return last ? last._id + 1 : 1;
}

Mongo.add = (collection, document) => {
  while (1) {
    try {
      document._id = Mongo._id(collection);
      return Mongo.insertOne(collection, document);
    }
    catch (e) {
      if (e.code != 11000) throw e;
    }
  }
}

Mongo.get = (collection, _id, fields) => {
  return Mongo.one(collection, {_id: parseInt(_id)}, fields);
}

Mongo.set = (collection, _id, set) => {
  return Mongo.update(collection, {_id: parseInt(_id)}, set);
}

Mongo.del = (collection, _id) => {
  return Mongo.remove(collection, {_id: parseInt(_id)});
}

module.exports = Mongo;
