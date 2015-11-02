var request = require('request-promise');

var Get = (uri, qs) => request({uri: uri, qs: qs});
Get.json = (uri, qs) => request({uri: uri, qs: qs, json: true});

module.exports = Get;
