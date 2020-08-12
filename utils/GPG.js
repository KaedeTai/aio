const gpg = require('../lib/gpg');
const config = require('../config');

var GPG = {};

GPG.sign = async msg => {
  const username = config.username;
  const password = config.password;
  try {
    return await gpg.sign(msg, username, password);
  }
  catch (e) {
    console.error(new Date(), 'GPG.sign error:', e);
    return false;
  }
};

GPG.verify = async msg => {
  try {
    return await gpg.verify(msg);
  }
  catch (e) {
    console.error(new Date(), 'GPG.verify error:', e);
    return false;
  }
};

GPG.importKey = async (filepath, password) => {
  try {
    return await gpg.importKey(filepath, password);
  }
  catch (e) {
    console.error(new Date(), 'GPG.verify error:', e);
    return false;
  }
};

module.exports = GPG;
