module.exports = {
  hostname: 'localhost',
  username: 'root',
  password: '',
  database: 'car',
  mongodb: 'mongodb://localhost:27017/dbname',
  images: '../images',
  gcm_key: '',
  ssl_key: 'ssl/key.txt',
  ssl_cert: 'ssl/cert.txt',
  md5_prefix: 'xxxxxxxx',
  networks: {
    '1': {
      name: "Mainnet",
      provider: 'https://mainnet.infura.io/v3/xxxxx',
      etherscanPrefix: "https://etherscan.io/",
    },
    '4': {
      name: "Rinkeby Testnet",
      provider: 'https://rinkeby.infura.io/v3/xxxxx',
      etherscanPrefix: "https://rinkeby.etherscan.io/",
    }
  },
  networkId: '4',
  gasPriceSpeed: 'fast', // fastest | fast | average | safeLow
  updateGasPriceInterval: 60000,
  gasPriceMultiplier: 1.0, // fetched gasPrice * x
  ga: 'UA-xxx-x', // google analytics tracking ID
  sms: { // twsms
    username: '0912345678',
    password: 'fjdfjj123456',
  },
};
