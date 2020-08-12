const web3 = require('web3');
const colors = require('colors');
const Semaphore = require('await-semaphore').Semaphore;

const config = require('../config');
const Mongo = require('../utils/Mongo');
const Get = require('../utils/Get');

const gasPrice = 20.1 * 1e9;
const gasLimit = 3000000;
const semaphore = new Semaphore(1);
const provider = new web3.providers.HttpProvider(config.networks[config.erc721_networkId].provider);
const Web3 = new web3(provider);
const contract = new Web3.eth.Contract(config.erc721_abi, config.erc721_address);
const password = process.env.SERVER_ERC721_KEYSTORE_PASSWORD;
const minter = Web3.eth.accounts.decrypt(config.erc721_keystore, password);
console.log('minter address:', minter.address.green);

let nonce = 0;

// Get nonce
(async (data) => {
  // get account balance
  const balance = await Web3.eth.getBalance(minter.address);
  console.log('minter balance:', (Web3.utils.fromWei(balance) + ' ETH').green);

  // get current nonce
  nonce = await Web3.eth.getTransactionCount(minter.address, 'pending');
  console.log('ERC721 nonce:', nonce);
})();

// Sleep for milliseconds
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

var ERC721 = {};

ERC721.transfers = async () => {
  var lastBlock = await Mongo.one('ERC721', {}, {blockNumber: 1}, {blockNumber: -1});
  var fromBlock = lastBlock? (lastBlock.blockNumber + 1): config.from;
  var transfers = await contract.getPastEvents('Transfer', {fromBlock});
  for (var i in transfers) {
    var t = transfers[i];
    await Mongo.add('ERC721', t);
  }
  return await Mongo.find('ERC721', {}, {}, {_id: -1});
}

ERC721.tokensOfOwner = async owner => {
  return await contract.methods.tokensOfOwner(owner).call();
}

ERC721.tokenURI = async token_id => {
  return await contract.methods.tokenURI(token_id).call();
}

ERC721.mintToken = async (fio, owner, name, description, image, external_url, token_data, hashCallback, callback) => {
  // use semaphore to ensure only one request is processed
  const release = await semaphore.acquire();

  // 先確認交易可行
  var last_token = await Mongo.one('erc721', {}, {_id: 1}, {_id: -1});
  var token_id = last_token? last_token._id + 1: 1;
  var uri = 'https://alpha.fio.one/fio/' + token_id;
  var data  = contract.methods.mintWithTokenURI(owner, token_id, uri);
  try {
    var gas = await data.estimateGas({from: minter.address, gas: 250000});
  }
  catch (e) {
    release();
    console.error(new Date(), e, owner, name, description, image, external_url, token_data);
    throw new Error(e);
  }

  // 產生token
  token_id = await Mongo.add('erc721', {date: new Date(), owner, name, description, image, data: token_data, username: fio.username, fio_id: fio._id});
  uri = 'https://alpha.fio.one/fio/' + token_id;
  //var external_url = 'https://openseacreatures.io/' + token_id; //TODO
  await Mongo.set('erc721', token_id, {uri, external_url});

  // 取得即時的價錢
  let price;
  while (!price) {
    try {
      price = await Get.json('https://ethgasstation.info/json/ethgasAPI.json');
    }
    catch (e) {
      console.error('Get ethgasAPI error:', e);
    }
  }

  const tx = {
    nonce: Web3.utils.toHex(nonce),
    networkId: config.erc721_networkId,
    to: contract._address,
    data: data.encodeABI(),
    value: 0,
    gasPrice: Web3.utils.toHex(price.fast / 10 * 1e9),
    gas: Web3.utils.toHex(250000),
  }

  const mint = {
    tx,
    tx_time: new Date(),
    owner,
    token_id,
    uri,
    status: 'open'
  }
  const mint_id = await Mongo.add('mint', mint);

  const sio = require('../sio');

  const signedTx = await minter.signTransaction(tx);
  Web3.eth.sendSignedTransaction(signedTx.rawTransaction)
  .once('transactionHash', async (hash) => {
    console.log('mint hash', hash);
    await Mongo.set('mint', mint_id, {hash, hash_time: new Date(), status: 'pending'});
    if (hashCallback) await hashCallback(hash);
    sio.emit('mint', mint_id, 'pending');
  })
  .once('receipt', async (receipt) => {
    console.log('mint receipt', receipt);
    await Mongo.set('mint', mint_id, {receipt, receipt_time: new Date(), status: 'done'});
    sio.emit('mint', mint_id, 'done');
    if (callback) await callback(receipt);
  })
  .on('error', async (error) => {
    console.log('error', error);
    await Mongo.set('mint', mint_id, {error, error_time: new Date(), status: 'error'});
    sio.emit('mint', mint_id, 'error');
  });

  // increase nonce
  nonce ++;

  // release semaphore
  release();
  return token_id;
}

module.exports = ERC721;
