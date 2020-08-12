var request = require('request-promise');

var Post = (uri, qs, headers) => request({method: 'POST', uri: uri, form: qs, headers});
Post.json = (uri, qs, headers) => request({method: 'POST', uri: uri, body: qs, json: true, headers});

module.exports = Post;
