var request = require('request-promise');
var await = require('asyncawait/await');

// Google('pizza');
Google = term => await(request.get('http://www.google.com/search?q=' + term).catch(err => 'timeout'));

module.exports = Google;
