// --------------------
//    Import modules
// --------------------
const 
  axios = require('axios'),
  crypto = require('crypto'),
  BN = require('bn.js'),
  hashjs = require('hash.js'),
  secp256k1 = require('elliptic').ec('secp256k1');

// --------------------
//    Initiate Singleton Instance
// --------------------
const instance = axios.create({
    baseURL: `https://api.zilliqa.com`,
    timeout: 3000,  // Timeout: 3 seconds
    headers: {
      'Content-Type': 'application/json',
    }
});

// --------------------
//    Define ViewBlock API-Client
// --------------------
const Zilliqa = {
  /**
   * Base function used for short-hand calling of parameter-less methods
   * @param {*} method_name 
   * @param {*} params 
   */
  async baseJsonRpcRequest(method_name, params=[]) {
    let body = {
      'id': '1',
      'jsonrpc': '2.0',
      'method': method_name,
      'params': params
    };
    return await instance.post('', body)
      .then(function(response) {
        return response.data.result;
      })
      .catch(function(error) {
        return error.response;
      });
  },

  /**
   * Returns the CHAIN_ID of the specified network.  
   * Zilliqa Mainnet (CHAIN_ID: 1)  
   * Developer Testnet (CHAIN_ID: 333)  
   */
  async networkId() {
    return await this.baseJsonRpcRequest('GetNetworkId');
  },

  /**
   * Returns the current network statistics for the specified network.
   */
  async blockchainInfo() {
    return await this.baseJsonRpcRequest('GetBlockchainInfo');
  },

  /**
   * Returns the details of the most recent Directory Service block. 
   */
  async latestDsBlock() {
    return await this.baseJsonRpcRequest('GetLatestDsBlock');
  },

  /**
   * Returns the current Directory Service blockrate per second.
   */
  async dsBlockRate() {
    return await this.baseJsonRpcRequest('GetDSBlockRate');
  },

  /**
   * eturns a paginated list of up to 10 Directory Service (DS) blocks  
   * and their block hashes for a specified page.  
   * The maxPages variable that specifies the maximum number  
   * of pages available is also returned.  
   * @param {number} maxPages Specifed page of DS blocks listing to return. Default: 1  
   */
  async dsBlockListing(maxPages=1) {
    return await this.baseJsonRpcRequest('DSBlockListing', [maxPages]);
  },

  /**
   * Returns the details of a specified Transaction block.  
   * @param {number} blocknum Specifed TX block number to return. Example: "40"  
   */
  async txBlock(blocknum) {
    return await this.baseJsonRpcRequest('GetTxBlock', [blocknum]);
  },
  
  /**
   * Returns the details of the most recent Transaction block.  
   */
  async latestTxBlock() {
    return await this.baseJsonRpcRequest('GetLatestTxBlock');
  },

  /**
   * Returns the current number of Transaction blocks in the network.  
   * This is represented as a `String`  
   * Example Response:  
   * {  
   *   "id": "1",  
   *   "jsonrpc": "2.0",  
   *   "result": "1000"  
   * }  
   */
  async numTxBlocks() {
    return await this.baseJsonRpcRequest('GetNumTxBlocks');
  },

  /**
   * Returns the current Transaction blockrate per second for the network.  
   */
  async txBlockRate() {
    return await this.baseJsonRpcRequest('GetTxBlockRate');
  },

  /**
   * Returns a paginated list of up to 10 Transaction blocks and their  
   * block hashes for a specified page. The maxPages variable that  
   * specifies the maximum number of pages available is also returned.  
   * @param {number} maxPages Specifed page of TX blocks listing to return. Default: 1
   */
  async txBlockListing(maxPages=1) {
    return await this.baseJsonRpcRequest('TxBlockListing', [maxPages]);
  },

  /**
   * Returns the current number of validated Transactions in the network.  
   * This is represented as a String.  
   * Example Response:  
   * {  
   *   "id": "1",  
   *   "jsonrpc": "2.0",  
   *   "result": "19"  
   * }  
   */
  async numTx() {
    return await this.baseJsonRpcRequest('GetNumTransactions');
  },

  /**
   * Returns the current Transaction rate per second (TPS) of the network.  
   * This is represented as an `Number`.  
   * Example Response:  
   * {  
   *   "id": "1",  
   *   "jsonrpc": "2.0",  
   *   "result": 0  
   * }  
   */
  async txRate() {
    return await this.baseJsonRpcRequest('GetTransactionRate');
  },

  /**
   * Returns the total supply (ZIL) of coins in the network.  
   * This is represented as a `String`.  
   * Example Response:  
   * {  
   *   "id": "1",  
   *   "jsonrpc": "2.0",  
   *   "result": "12600527397.260273972000"  
   * }  
   */
  async totalSupply() {
    return await this.baseJsonRpcRequest('GetTotalCoinSupply');
  },

  /**
   * Returns the current balance of an account,  
   * measured in the smallest accounting unit Qa (or 10^-12 Zil).  
   * This is represented as a `String`.  
   * Also returns the current nonce of an account.  
   * This is represented as an `Number`.  
   * Example Response:  
   * {
   *   "id": "1",  
   *   "jsonrpc": "2.0",  
   *   "result": {  
   *     "balance": "18446744073637511711",  
   *     "nonce": 16  
   *   }  
   * }  
   * @param {*} address 
   */
  async balance(address) {
    return await this.baseJsonRpcRequest('GetBalance', [ address ]);
  },

  /**
   * Returns the most recent 100 transactions that are validated by the Zilliqa network.  
   * @param {*} address 
   */
  async recentTxs(address) {
    return await this.baseJsonRpcRequest('GetRecentTransactions');
  },

  /**
   * Creates a new keypair with a randomly-generated private key.  
   * The new account is accessible by address.  
   * Example Response:  
   * {  
   *   privkey: '...', pubkey: '...', address: '...'  
   * }  
   */
  newAddress() {
    const privkey_size_bytes = 32;
    const privkey = secp256k1.genKeyPair({
        entropy: crypto.randomBytes(secp256k1.curve.n.byteLength()),
        entropyEnc: 'hex',
        pers: 'zilliqajs+secp256k1+SHA256',
      }).getPrivate().toString(16, privkey_size_bytes * 2);
    const normalized = privkey.toLowerCase().replace('0x', '');
    const keyPair = secp256k1.keyFromPrivate(normalized, 'hex');
    const pubkey = keyPair.getPublic(true, 'hex');
    const address = hashjs.sha256().update(pubkey,'hex').digest('hex').slice(24);
    const bech32Address = this.toBech32Address(address);
    return { privkey, pubkey, address, bech32Address };
  },
  
  checksum(address) {
    address = address.toLowerCase().replace('0x', '');
    const hash = hashjs
      .sha256()
      .update(address, 'hex')
      .digest('hex');
    const v = new BN(hash, 'hex', 'be');
    let ret = '0x';
    for (let i = 0; i < address.length; i++) {
      if ('0123456789'.indexOf(address[i]) !== -1) {
        ret += address[i];
      } else {
        ret += v.and(new BN(2).pow(new BN(255 - 6 * i))).gte(new BN(1))
          ? address[i].toUpperCase()
          : address[i].toLowerCase();
      }
    }
    return ret;
  },

  /**
   * 
   * @param {string} hrp 
   * @param {Buffer} buf 
   */
  createChecksum(hrp, buf) {
    const values = Buffer.concat([
      Buffer.from(this.hrpExpand(hrp)), buf, Buffer.from([0, 0, 0, 0, 0, 0]),
    ]);
    const mod = this.polymod(values) ^ 1;
    const ret = [];
    for (let p = 0; p < 6; ++p) {
      ret.push((mod >> (5 * (5 - p))) & 31);
    }
    return Buffer.from(ret);
  },

  /**
   * 
   * @param {string} hrp 
   * @param {Buffer} buf 
   */
  encode(hrp, buf) {
    const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    const combined = Buffer.concat([buf, this.createChecksum(hrp, buf)]);
    let ret = hrp + '1';
    for (let p = 0; p < combined.length; ++p) {
      ret += CHARSET.charAt(combined[p]);
    }
    return ret;
  },

  /**
   * 
   * @param {string} hrp 
   */
  hrpExpand(hrp){
    const ret = [];
    let p;
    for (p = 0; p < hrp.length; ++p) {
      ret.push(hrp.charCodeAt(p) >> 5);
    }
    ret.push(0);
    for (p = 0; p < hrp.length; ++p) {
      ret.push(hrp.charCodeAt(p) & 31);
    }
    return Buffer.from(ret);
  },

  /**
   * Groups buffers of a certain width to buffers of the desired width.  
   * For example, converts byte buffers to buffers of maximum 5 bit numbers,  
   * padding those numbers as necessary. Necessary for encoding Ethereum-style  
   * addresses as bech32 ones.  
   * @param {Buffer} data 
   * @param {number} fromWidth 
   * @param {number} toWidth 
   * @param {boolean} pad (Default: true)
   */
  convertBits(data, fromWidth, toWidth, pad=true) {
    let acc = 0;
    let bits = 0;
    const ret = [];
    const maxv = (1 << toWidth) - 1;
    for (let p = 0; p < data.length; ++p) {
      const value = data[p];
      if (value < 0 || value >> fromWidth !== 0) {
        return null;
      }
      acc = (acc << fromWidth) | value;
      bits += fromWidth;
      while (bits >= toWidth) {
        bits -= toWidth;
        ret.push((acc >> bits) & maxv);
      }
    }
    if (pad) {
      if (bits > 0) {
        ret.push((acc << (toWidth - bits)) & maxv);
      }
    } else if (bits >= fromWidth || (acc << (toWidth - bits)) & maxv) {
      return null;
    }
    return Buffer.from(ret);
  },

  /**
   * 
   * @param {Buffer} values 
   */
  polymod(values) {
    const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (let p = 0; p < values.length; ++p) {
      const top = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ values[p];
      for (let i = 0; i < 5; ++i) {
        if ((top >> i) & 1) {
          chk ^= GENERATOR[i];
        }
      }
    }
    return chk;
  },

  toBech32Address(address) {
    // HRP is the human-readable part of zilliqa bech32 addresses
    let HRP = 'zil';
    address = address.toLowerCase().replace('0x', '');
    let addrBz = this.convertBits(
      Buffer.from(address, 'hex'),
      8, 5
    );
    return this.encode(HRP, addrBz);
  }
};
module.exports = Zilliqa;