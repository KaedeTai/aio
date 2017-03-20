var crypto = require('crypto');

//var api_pw =  new Buffer('1e79ce6e991f50c8abaa8f2d63d1da71', 'hex');
var api_pw =  '1e79ce6e991f50c8abaa8f2d63d1da71';
var api_iv = 'c94ca0db0ea8a740';

var db_pw = 'c00c06c60bbf69afd7b4b342ec62cdbc';
var db_iv = 'f7a20e28ebaf0407';

var AES = () => {};

AES.encAPI = text => {
  if (!text) return null;
  var enc = crypto.createCipheriv('aes-256-cbc', api_pw, api_iv);
  return enc.update(text, 'utf8', 'hex') + enc.final('hex');
};

AES.decAPI = cipher => {
  if (!cipher) return null;
  var dec = crypto.createDecipheriv('aes-256-cbc', api_pw, api_iv);
  return dec.update(cipher, 'hex', 'utf8') + dec.final('utf8');
};

AES.encDB = text => {
  if (!text) return null;
  var enc = crypto.createCipheriv('aes-256-cbc', db_pw, db_iv);
  return enc.update(text, 'utf8', 'hex') + enc.final('hex');
};

AES.decDB = cipher => {
  if (!cipher) return null;
  var dec = crypto.createDecipheriv('aes-256-cbc', db_pw, db_iv);
  return dec.update(cipher, 'hex', 'utf8') + dec.final('utf8');
};

module.exports = AES;
