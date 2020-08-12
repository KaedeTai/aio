var request = require('request-promise');

var Get = (uri, qs, headers) => request({uri: uri, qs: qs, headers});
Get.json = (uri, qs, headers) => request({uri: uri, qs: qs, json: true, headers});

module.exports = Get;
