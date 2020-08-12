var crypto = require('crypto');
var config = require('../config');

var api_pw = config.aes.api_pw;
var api_iv = config.aes.api_iv;

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

module.exports = AES;
