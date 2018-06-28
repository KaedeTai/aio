var request = require('request-promise');

var Get = (uri, qs) => await(request({uri: uri, qs: qs}));
Get.json = (uri, qs) => await(request({uri: uri, qs: qs, json: true}));

module.exports = Get;
