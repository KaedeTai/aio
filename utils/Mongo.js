var mongo = require('mongodb').MongoClient;
var config = require('../config');

var db;

var Mongo = async () => {
  var client = await mongo.connect(config.mongodb, {
    reconnectInterval: 1000, // wait for 1 seconds before retry
    reconnectTries: Number.MAX_VALUE, // retry forever
  });
  return client.db(config.mongodb_name);
}

Mongo.find = async (collection, find, fields, sort, limit, skip) => {
  if (!db) db = await Mongo();
  var query = db.collection(collection).find(find);
  if (fields) query = query.project(fields);
  if (sort) query = query.sort(sort);
  if (skip) query = query.skip(skip);
  if (limit) query = query.limit(limit);
  return await query.toArray();
}

Mongo.one = async (collection, find, fields, sort) => {
  if (!db) db = await Mongo();
  var cursor = await db.collection(collection).find(find).project(fields).sort(sort).limit(1);
  var arr = [];
  if (item = await cursor.next()) {
    return item;
  }
  return null;
}

Mongo.insert = async (collection, insert) => {
  if (!db) db = await Mongo();
  var rs = await db.collection(collection).insert(insert);
  return {inserted: rs.insertedCount, _ids: rs.insertedIds};
}

Mongo.insertOne = async (collection, one) => {
  if (!db) db = await Mongo();
  var rs = await db.collection(collection).insertOne(one);
  return {inserted: rs.insertedCount, _id: rs.insertedId};
}

Mongo.insertMany = async (collection, arr) => {
  if (!db) db = await Mongo();
  var rs = await db.collection(collection).insertMany(arr);
  return {inserted: rs.insertedCount, _ids: rs.insertedIds};
}

Mongo.update = async (collection, update, set) => {
  if (!db) db = await Mongo();
  var rs = await db.collection(collection).updateOne(update, {$set: set});
  return {matched: rs.matchedCount, updated: rs.modifiedCount};
}

Mongo.updateMany = async (collection, update, set) => {
  if (!db) db = await Mongo();
  var rs = await db.collection(collection).updateMany(update, {$set: set});
  return {matched: rs.matchedCount, updated: rs.modifiedCount};
}

Mongo.update.unset = async (collection, update, set, unset) => {
  if (!db) db = await Mongo();
  var rs = await db.collection(collection).updateOne(update, {$set: set, $unset: unset});
  return {matched: rs.matchedCount, updated: rs.modifiedCount};
}

Mongo.unset = async (collection, update, unset) => {
  if (!db) db = await Mongo();
  var rs = await db.collection(collection).updateOne(update, {$unset: unset});
  return {matched: rs.matchedCount, updated: rs.modifiedCount};
}

Mongo.remove = async (collection, remove) => {
  if (!db) db = await Mongo();
  var rs = await db.collection(collection).removeOne(remove);
  return {removed: rs.deletedCount};
}

Mongo.listCollections = async (collection) => {
  if (!db) db = await Mongo();
  var cols = await db.listCollections({name: collection});
  return cols.toArray();
}

Mongo.exists = async (collection) => {
  if (!db) db = await Mongo();
  var cols = await db.listCollections({name: collection});
  return cols.length;
}

Mongo.create = async (collection) => {
  if (!db) db = await Mongo();
  return await db.createCollection(collection);
}

Mongo.truncate = async (collection) => {
  if (!db) db = await Mongo();
  return await db.collection(collection).remove({}).result.n;
}

Mongo.count = async (collection, find) => {
  if (!db) db = await Mongo();
  return await db.collection(collection).count(find);
}

// manage by auto increment _id

Mongo._id = async (collection) => {
  var last = await Mongo.one(collection, {}, {_id: 1}, {_id: -1});
  return last ? last._id + 1 : 1;
}

Mongo.add = async (collection, document) => {
  while (1) {
    try {
      document._id = await Mongo._id(collection);
      var one = await Mongo.insertOne(collection, document);
      delete document._id;
      return one._id;
    }
    catch (e) {
      if (e.code != 11000) throw e;
    }
  }
}

Mongo.get = async (collection, _id, fields) => {
  return await Mongo.one(collection, {_id: parseInt(_id)}, fields);
}

Mongo.set = async (collection, _id, set) => {
  return await Mongo.update(collection, {_id: parseInt(_id)}, set);
}

Mongo.del = async (collection, _id) => {
  return await Mongo.remove(collection, {_id: parseInt(_id)});
}

Mongo.aggregate = async (collection, pipeline, options, sort, limit, skip) => {
  if (!db) db = await Mongo();
  var query = db.collection(collection).aggregate(pipeline, options);
  if (sort) query = query.sort(sort);
  if (skip) query = query.skip(skip);
  if (limit) query = query.limit(limit);
  var cursor = await query;
  var arr = [];
  while (item = await cursor.next()) {
    arr.push(item);
  }
  return arr;
}

module.exports = Mongo;
