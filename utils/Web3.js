const colors = require('colors');
const web3 = require('web3');
const Get = require('../utils/Get');
const { keystore, networks, networkId, gasPriceSpeed, gasPriceMultiplier, updateGasPriceInterval } = require('../config');
const provider = new web3.providers.HttpProvider(networks[networkId].provider);
const Web3 = new web3(provider);

Web3.getTxUrl = txHash => networks[networkId].etherscanPrefix + 'tx/' + txHash;

console.log('on', networks[networkId].name.red);

// init account and nonce
(async (data) => {
  const password = process.env.SERVER_WALLET_KEYSTORE_PASSWORD;

  Web3.wallet = Web3.eth.accounts.decrypt(keystore, password);
  console.log('server wallet address:', Web3.wallet.address.green);

  // get account balance
  const balance = await Web3.eth.getBalance(Web3.wallet.address); // string
  console.log('balance:', (Web3.utils.fromWei(balance) + ' ETH').green);

  // get current nonce
  Web3.nonce = await Web3.eth.getTransactionCount(Web3.wallet.address, 'pending');
})();

const valid_speeds = new Set(['fast', 'average', 'safeLow']);

let defaultGasPriceInfo = {
  "block_time": 15,
  "blockNum": 7062991,
  "speed": 0.8456828554746485,
  "fastest": 200.0,
  "fast": 100.0,
  "average": 50.0,
  "safeLow": 30.0,
  "fastestWait": 0.6,
  "fastWait": 0.6,
  "avgWait": 2.2,
  "safeLowWait": 15.2,
};

let gasPriceInfo = defaultGasPriceInfo;

Web3.getGasPrice = speed => {
  if (!valid_speeds.has(speed)) speed = gasPriceSpeed;
  const gasPrice = Math.ceil(
    gasPriceInfo[speed] / 10 * gasPriceMultiplier
  ) * 1e9 + 1;
  console.log('gasPrice for', speed.red, 'is',
    (Web3.utils.fromWei(gasPrice.toString(), 'gwei') + ' gwei').green
  );
  return gasPrice;
};
  
Web3.fetchGasPrice = async () => {
  try {
    const _gasPriceInfo = await Get.json('https://ethgasstation.info/json/ethgasAPI.json');
    Web3.gasPriceInfo = _gasPriceInfo;
    // console.log('ethgasstation ethgasAPI gasPriceInfo', _gasPriceInfo);
  } catch (error) {
    console.error(new Date(), 'ethgasstation ethgasAPI error');
  }
};

Web3.fetchGasPrice();
setInterval(Web3.fetchGasPrice, updateGasPriceInterval);

Web3.getServerWalletAddress = () => {
  return Web3.wallet.address;
};

module.exports = Web3;
