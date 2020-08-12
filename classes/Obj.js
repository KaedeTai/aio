var mustache = require('mustache');
var config = require('../config');
var Sheet = require('../models/Sheet');
var ERC721 = require('../models/ERC721');
var AuthSec = require('../models/AuthSec');
var GPG = require('../utils/GPG');
var IOTA = require('../utils/IOTA');
var Mongo = require('../utils/Mongo');
var SendGrid = require('../utils/SendGrid');
var FS = require('../utils/FS');

var DB = require('../classes/DB');


// 發ERC721的NFT
var API_ERC721_mintToken = async (contract) => {
  // 準備資料
  var obj = contract.obj;
  var fio = contract.fio;
  var input = fio.input;
  var output = fio.output;
  var owner = obj.get(input.owner);
  var name = obj.get(input.name);
  var description = obj.get(input.description);
  var image = obj.get(input.image);
  var external_url = obj.get(input.external_url);
  var data = obj.dict(input.data);

  var token_id = obj.get(output.token_id);
  if (!token_id) {
    // 新增
    token_id = await contract.ERC721_mintToken(owner, name, description, image, external_url, data, async hash => {
      await obj.set(output.hash, hash);
      await obj.set(output.tx_url, 'https://etherscan.io/tx/' + hash);
    });
    await obj.set(output.token_url, 'https://etherscan.io/token/' + config.erc721_address + '?a=' + token_id);
    await obj.set(output.token_id, token_id);
  }
  else {
    // 更新
    await contract.ERC721_setToken(owner, name, description, image, external_url, data, token_id);
  }
  return token_id;
};

// 把資料用GPG簽章並上IOTA
var API_GPG_sign_IOTA_send = async (contract) => {
  // 準備資料
  var obj = contract.obj;
  var fio = contract.fio;
  var input = fio.input;
  var output = fio.output;
  var msg = obj.dict(input);

  // 將JSON字串化後簽章
  var signed = await contract.GPG_sign(JSON.stringify(msg));

  // 發佈到IOTA
  var bundle = await contract.IOTA_send(signed);

  // 記錄資料
  var date = new Date();
  var hash = bundle.map(x => x.hash).join('+');

  // 檢查是否有token_id欄位
  if (output.token_id) {
    // 完整歷史資料
    var token_id = parseInt(obj.get(output.token_id));
    if (!token_id) {
      // 新增
      token_id = await contract.db.add('iota', {date, hash, msg});
      await obj.set(output.token_id, token_id);
    }
    else {
      // 更新
      await contract.db.set('iota', token_id, {date, hash, msg});
    }
    await contract.db.add('iota_log', {date, token_id, hash, msg});
  }

  // 更新Google Sheet
  await obj.set(output.hash, hash);
};


// 合約類別
class Contract {
  // 建構子
  constructor(obj) {
    var fio = obj.fio;
    this.start_date = new Date();
    this.fio = fio;
    this.obj = obj;
    this.db = new DB(fio._id);

    // 發ERC721的NFT
    if (fio.api == 'ERC721.mintToken') {
      this.code = API_ERC721_mintToken;
    }

    // 把資料用GPG簽章並上IOTA
    if (fio.api == 'GPG.sign+IOTA.send') {
      this.code = API_GPG_sign_IOTA_send;
    }

    // 執行自定義code
    if (fio.api == 'Contract') {
      // TODO: 未來要改成在設定的當下檢查語法並更新 .js 檔案，這邊直接require
      FS.write('/tmp/code_' + fio._id + '.js', 'module.exports = ' + fio.code);
      this.code = require('/tmp/code_' + fio._id);
    }
  }


  // 合約中會用到的必要函示

  // 紀錄合約成功
  async done(result) {
    Mongo.add('contract_log', {
      done_date: new Date(),
      start_date: this.start_date,
      obj: this.obj,
      result,
      status: 'done'
    });
    this.obj.done();
  }

  // 紀錄合約失敗
  async error(error) {
    Mongo.add('contract_log', {
      error_date: new Date(),
      start_date: this.start_date,
      obj: this.obj,
      error,
      status: 'error'
    });
    this.obj.error();
  }


  // 提供給合約使用的功能函示，可視需求增加

  // 發行ERC721的NFT(demo版)
  async ERC721_mintToken(owner, name, description, image, external_url, data, hashCallback) {
    return new Promise(async (resolve, reject) => {
      try {
        const token_id = await ERC721.mintToken(this.fio, owner, name, description, image, external_url, data, hashCallback, () => resolve(token_id));
        const date = new Date();
        await Mongo.add('erc721_log', {token_id, date, username: this.fio.username, fio_id: this.fio._id, owner, name, description, image, external_url, data});
      }
      catch (e) {
        reject(e);
      }
    });
  }

  // 更新ERC721的NFT(demo版)
  async ERC721_setToken(owner, name, description, image, external_url, data, token_id) {
    token_id = parseInt(token_id);
    const date = new Date();
    await Mongo.set('erc721', token_id, {date, username: this.fio.username, fio_id: this.fio._id, owner, name, description, image, external_url, data});
    await Mongo.add('erc721_log', {token_id, date, username: this.fio.username, fio_id: this.fio._id, owner, name, description, image, external_url, data});
    return token_id;
  }

  // 將字串簽章
  async GPG_sign(str) {
    return await GPG.sign(str);
  }

  // 發佈到IOTA
  async IOTA_send(data) {
    const bundle = await IOTA.send(data);
    console.log('IOTA_send succeed:', bundle);
    return bundle;
  }

  // 用SendGrid發email
  async SendGrid_send(to, from, subject, text, html, view) {
    if (view) {
      subject = mustache.render(subject, view);
      text = mustache.render(text, view);
      html = mustache.render(html, view);
    }
    var mail = {to, from, subject, text, html};
    return (await SendGrid.send(mail))[0].toJSON();
  }

  // 註冊AuthSec帳號並進行手機配對
  async AuthSec_pair(account, name, email) {
    try {
      // 註冊帳號
      await AuthSec.register(account, name, email);
    }
    catch (e) {
      // 已經有帳號了，忽略錯誤
      console.error(new Date(), e);
    }

    // 取得手機配對URL
    var result = await AuthSec.pair(account);
    return result.url;
  }

  // 用AuthSec進行confirm
  async AuthSec_confirm(account, title, body, data) {
    const result = await AuthSec.confirm(account, title, body, data);
    if (result.behavior_result == 3) throw 'AuthSec_confirm timeout';
    return result.behavior_result == 2; // 1: reject 2: accept 3: timeout
  }

  // 呼叫另一個FiO
  async Call(fio_id, obj_id, set) {
    // TODO: 檢查
    var fio = await Mongo.get('fio', fio_id);

    var obj = new Obj(fio);
    await obj.init(obj_id);
    // TODO: 改成一次更新
    for (var key in set) {
      await obj.set(key, set[key]);
    }
    // 產生合約物件並執行
    return obj.run();
  }

  // 輸出到另一個表單
  async outputValues(rows) {
    var fio = this.fio;
    var token = fio.outputValues.token || fio.token;
    var sheet = fio.outputValues.sheet || fio.sheet;
    var tab = fio.outputValues.tab || fio.tab;
    var output = fio.outputValues.output || fio.output;
    var fields = (await Sheet.getValues(token, sheet, tab, 'A1:ZZ1'))[0];

    var keys = {};
    for (var i = 0; i < fields.length; i ++)
      keys[fields[i]] = i;

    var all = rows.map(row => {
      var arr = new Array(fields.length);
      for (var key in row) {
        arr[keys[output[key]]] = row[key];
      }
      return arr;
    });

    var result = await Sheet.addValues(token, sheet, tab, all);
    console.log('Sheet.addValues succeed:', result);
    return result;
  }
}


// 資料物件類別
class Obj {
  // 建構子
  constructor(fio) {
    // 往前相容
    if (fio.apis) {
      fio.input = fio.apis[0].input;
      fio.output = fio.apis[0].output;
      fio.api = fio.apis[0].api;
    }
    this.fio = fio;
    this.vals = {};
  }

  // 取得欄位值
  get(key) {
    return this.vals[key];
  }

  // 取得key對應值的字典
  dict(map) {
    var d = {};
    for (var k in map)
      d[k] = this.vals[map[k]];
    return d;
  }

  // 起始資料
  async init(obj_id) {
    const fio = this.fio;
    const table = 'fio_' + fio._id + '_obj';
    if (!fio.obj_id) throw Error('invalid fio.obj_id');
    var find = {};
    find[fio.obj_id] = obj_id;
    this.vals = await Mongo.one(table, find, {_id: 0});
    if (!this.vals) throw Error('invalid obj_id');
    this.obj_id = obj_id;
  }

  // 根據條件起始資料
  async initFind(key, value) {
    const fio = this.fio;
    const table = 'fio_' + fio._id + '_obj';
    if (!fio.obj_id) throw Error('invalid fio.obj_id');
    var find = {};
    find[key] = value;
    this.vals = await Mongo.one(table, find, {_id: 0});
    if (!this.vals) throw Error('invalid key & value');
    this.obj_id = this.vals[fio.obj_id];
  }

  // 起始新資料
  async initNewObj(data) {
    const fio = this.fio;
    const table = 'fio_' + fio._id + '_obj';
    if (!fio.obj_id) throw Error('invalid fio.obj_id');
    this.vals = data;
    this.obj_id = data[fio.obj_id];
    if (this.obj_id) {
      await Mongo.add(table, data);
    }
    else {
      // 自動產生obj_id
      this.vals[fio.obj_id] = this.obj_id = (await Mongo.add(table, {})).toString();
      await Mongo.set(table, this.obj_id, this.vals);
    }
    await Mongo.add(table + '_log', {date: new Date(), obj_id: this.obj_id, add: this.vals});

    // 新增到 Google Sheet 
    if (this.fio.sheet) {
      await this.getKeys(data);
    }
  }

  // 從Sheet起始資料
  async initFromSheet(keys, row, y) {
    this.keys = keys;
    this.y = y;
    for (var k in keys)
      this.vals[k] = row[keys[k]];

    // 檢查是否有obj_id
    const fio = this.fio;
    const table = 'fio_' + fio._id + '_obj';

    // 若沒有設定fio.obj_id欄位或欄位不存在則不產生obj
    if (!fio.obj_id || !(fio.obj_id in this.keys)) return;

    // 取得obj_id
    this.obj_id = this.get(fio.obj_id);

    if (this.obj_id) {
      // 若obj存在就沒事了
      var find = {};
      find[fio.obj_id] = this.obj_id;
      var obj = await Mongo.one(table, find);
      if (obj) return;

      // 新增obj
      await Mongo.add(table, this.vals);
    }
    else {
      // 自動產生obj_id
      this.vals[fio.obj_id] = this.obj_id = (await Mongo.add(table, {})).toString();
      await Mongo.set(table, this.obj_id, this.vals);
      await Sheet.setValues(fio.token, fio.sheet, fio.tab, Sheet.range(keys[fio.obj_id], y), [[this.obj_id]]);
    }
    await Mongo.add(table + '_log', {date: new Date(), obj_id: this.obj_id, add: this.vals});
  }

  // 開始執行合約
  async run() {
    var contract = new Contract(this);
    return this.pending().then(
      () => contract.code(contract)
    ).then(
      result => contract.done(result)
    ).catch(
      error => contract.error(error.error || error.toString())
    );
  }

  // 設定欄位值
  async getKeys(data) {
    const fio = this.fio;
    let values = await Sheet.getValues(fio.token, fio.sheet, fio.tab, 'A:ZZ');

    // 自動關閉無效fio
    if (!values) {
      console.error(new Date(), 'fio error and disabled:', fio)
      await Mongo.set('fio', fio._id, {enabled: false});
      return;
    }

    // 把欄位名稱對應為表單上第幾個列
    var keys = {};
    for (var i = 0; i < values[0].length; i ++)
      keys[values[0][i]] = i;
    this.keys = keys;

    // 如果有新增資料
    if (data) {
      var arr = new Array(values[0].length);
      for (var key in data) {
        arr[keys[key]] = data[key];
      }
      // 新增資料
      await Sheet.addValues(fio.token, fio.sheet, fio.tab, [arr]);
    }

    // 檢查是否有obj_id
    if (!this.obj_id || !fio.obj_id || !(fio.obj_id in this.keys)) return;

    // 重新讀取內容
    if (data) values = await Sheet.getValues(fio.token, fio.sheet, fio.tab, 'A:ZZ');

    // 找出資料的位置
    const col = keys[fio.obj_id];
    for (var i = 1; i < values.length; i ++) {
      if (values[i][col] == this.obj_id) {
        this.y = i;
        break;
      }
    }
  }

  // 設定欄位值
  async set(key, value) {
    this.vals[key] = value;

    // 紀錄完整歷史資料
    if (this.obj_id) {
      const table = 'fio_' + this.fio._id + '_obj';
      var set = {};
      set[key] = value;
      await Mongo.set(table, this.obj_id, set);
      await Mongo.add(table + '_log', {date: new Date(), obj_id: this.obj_id, set});
    }

    // 更新Sheet資料
    const fio = this.fio;
    if (fio.sheet) {
      // 取得欄位資訊 keys 與資料位置 y
      if (!this.keys) await this.getKeys();

      // 檢查資料是否存在
      if (!this.y) {
        console.error(new Date(), `_id not exists in sheet!`);
        return;
      }

      // 檢查欄位是否存在
      if (!(key in this.keys)) {
        console.error(new Date(), `key ${key} not exists in keys!`);
        return;
      }

      // 更新欄位
      await Sheet.setValues(fio.token, fio.sheet, fio.tab, Sheet.range(this.keys[key], this.y), [[value]]);
    }
  };

  // 設定狀態為等待中
  async pending() {
    return await this.set(this.fio.confirm, this.fio.pending || 'Pending');
  }

  // 設定狀態為已完成
  async done() {
    return await this.set(this.fio.confirm, this.fio.done || 'Done');
  }

  // 設定狀態為錯誤
  async error() {
    return await this.set(this.fio.confirm, this.fio.error || 'Error');
  }
}

module.exports = Obj;
