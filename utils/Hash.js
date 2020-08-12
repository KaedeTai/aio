const crypto = require('crypto');
let md5_prefix = require('../config').md5_prefix;

Hash = text => {
  var hash = crypto.createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
};

Hash.md5 = text => {
  return crypto.createHash('md5').update(md5_prefix + text).digest("hex");
}

Hash.genHex = length => {
  var buffer = crypto.randomBytes(length/2);
  return buffer.toString('hex');
};

module.exports = Hash;
