const crypto = require('crypto');

Hash = text => {
  var hash = crypto.createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
};

module.exports = Hash;
