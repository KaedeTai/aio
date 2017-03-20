var request = require('request-promise');
var await = require('asyncawait/await');

var Post = (uri, qs) => await(request({method: 'POST', uri: uri, form: qs}));
Post.json = (uri, qs) => await(request({method: 'POST', uri: uri, body: qs, json: true}));

module.exports = Post;
