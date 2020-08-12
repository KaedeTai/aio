var request = require('request-promise');

var Put = (uri, qs) => request({method: 'PUT', uri: uri, form: qs});
Put.json = (uri, qs) => request({method: 'PUT', uri: uri, body: qs, json: true});

module.exports = Put;
