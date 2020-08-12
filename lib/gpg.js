'use strict';

const spawnGPG = require('./spawn-gpg');
const parser = require('./parser');

function list() {
  return new Promise((resolve, reject) => {
    
    spawnGPG(['--list-keys', '--fingerprint'])
      .then(result => {
        var entries = result.content.split('\n\n');
        if (entries[entries.length - 1] === '') entries.pop();
        var keys = [];
  
        entries.forEach(entry => {
          const key = parser.parseKey(entry);
          keys.push(key);
        });
  
        resolve(keys);
      })
      .catch(e => reject(e));
  });
}

function info(email) {
  return new Promise((resolve, reject) => {

    spawnGPG(['--list-keys', '--fingerprint', email])
    .then(result => {
      const key = parser.parseKey(result.content);
      resolve(key);
    })
    .catch(e => reject(e));
  });
}

var queue = [];

function sign(message, username, password) {
  return new Promise((resolve, reject) => {
    queue.push({
      command: ['--pinentry-mode=loopback', '--passphrase-fd', '0', '--clear-sign', '-u', username],
      stdin: password + '\n' + message,
      resolve: result => resolve(result.content),
      reject
    });
  });
}

function importKey(filepath, password) {
  return new Promise((resolve, reject) => {
    queue.push({
      command: ['--pinentry-mode=loopback', '--passphrase-fd', '0', '--import', filepath],
      stdin: password + '\n',
      resolve: result => resolve(result.message), //TODO: parse message
      reject
    });
  });
}

async function runGPG() {
  while (queue.length) {
    var task = queue[0];
    try {
      var result = await spawnGPG(task.command, task.stdin);
      queue.splice(0, 1); // remove frome queue
      task.resolve(result);
    }
    catch (error) {
      queue.splice(0, 1); // remove frome queue
      console.error(new Date(), 'runGPG error:', error, task);
      task.reject(error);
      break;
    }
  }
  setTimeout(runGPG, 1000);
}
setTimeout(runGPG, 1000);

function verify(message) {
  return new Promise((resolve, reject) => {

    spawnGPG(['--verify'], message)
    .then(result => {
      var data = parser.parseVerified(result.message);
      resolve(data);
    })
    .catch(e => reject(e));
  });
}

function encrypt(message, user, recipient) {
  return new Promise((resolve, reject) => {
    spawnGPG(['--encrypt', '-u', user, '-r', recipient, '--armor'], message)
    .then(result => {
      resolve(result.content);
    })
    .catch(e => reject(e));
  });
}

function decrypt(message) {
  return new Promise((resolve, reject) => {
    spawnGPG(['--decrypt', '--armor'], message)
      .then(result => {
        const data = parser.parseDecryptMessage(result.message);
        const merged = { content: result.content, ...data };
        resolve(merged);
      })
      .catch(e => reject(e));
  });
}



module.exports = {
  list,
  info,
  sign,
  verify,
  encrypt,
  decrypt,
  importKey
};