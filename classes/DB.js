var Mongo = require('../utils/Mongo');

// 資料庫類別
module.exports = class DB {
  constructor(fio_id) {
    this.fio_id = fio_id;
  }

  find(collection, where, fields, sort, limit, skip) {
    return Mongo.find('fio_' + this.fio_id + '_' + collection, where, fields, sort, limit, skip);
  }

  get(collection, id) {
    return Mongo.get('fio_' + this.fio_id + '_' + collection, id);
  }

  add(collection, document) {
    return Mongo.add('fio_' + this.fio_id + '_' + collection, document);
  }

  set(collection, id, document) {
    return Mongo.set('fio_' + this.fio_id + '_' + collection, id, document);
  }

  del(collection, id) {
    return Mongo.del('fio_' + this.fio_id + '_' + collection, id);
  }
}

