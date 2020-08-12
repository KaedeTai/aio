const composeAPI = require('@iota/core').composeAPI;
const Trytes = require('trytes');
const config = require('../config');
const iota = composeAPI({
  provider: 'https://nodes.thetangle.org'
})

// Must be truly random & 81-trytes long.
const seed = config.aio.seed;

// Depth or how far to go for tip selection entry point.
const depth = 3

// Difficulty of Proof-of-Work required to attach transaction to tangle.
// Minimum value on mainnet is `14`, `7` on spamnet and `9` on devnet and other testnets.
const minWeightMagnitude = 14

var queue = [];

var IOTA = {};

IOTA.send = (msg, tag) => new Promise(async (resolve, reject) => {
  // Array of transfers which defines transfer recipients and value transferred in IOTAs.
  if (!tag) tag = config.aio.tag;
  const transfers = [{
    address: config.aio.address,
    value: 0, // 1Ki
    tag, // optional tag of `0-27` trytes
    message: Trytes.encodeTextAsTryteString(msg)
  }]
  const trytes = await iota.prepareTransfers(seed, transfers);

  // send to IOTA immediately
  iota.sendTrytes(trytes, depth, minWeightMagnitude).then(resolve).catch(error => {
    console.error(new Date(), 'IOTA.sendTrytes error! push to queue:', error, trytes);

    // retry
    queue.push({trytes, resolve, reject});
  });
});

async function retry() {
  while (queue.length) {
    var task = queue[0];
    try {
      var bundle = await iota.sendTrytes(task.trytes, depth, minWeightMagnitude);      
      queue.splice(0, 1); // remove frome queue
      task.resolve(bundle);
    }
    catch (error) {
      console.error(new Date(), 'retry IOTA.sendTrytes error:', error, task.trytes);
      queue.splice(0, 1); // remove frome queue
      task.reject(error);
      break;
    }
  }
  setTimeout(retry, 1000);
}
setTimeout(retry, 1000);

IOTA.toStr = trytes => {
  while (true) {
    try {
      return Trytes.decodeTextFromTryteString(trytes).replace(/\u0000+$/, '');
    }
    catch (e) {
      trytes += '9';
    }
  }
}
IOTA.read = hash => getTransactionObjects([hash])[0];

module.exports = IOTA;
