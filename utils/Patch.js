var request = require('request-promise');

var Patch = (uri, qs, headers) => request({method: 'PATCH', uri: uri, form: qs, headers});
Patch.json = (uri, qs, headers) => request({method: 'PATCH', uri: uri, body: qs, json: true, headers});

module.exports = Patch;
