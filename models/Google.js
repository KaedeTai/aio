var request = require('request-promise');

// Google('pizza');
Google = term => request.get('http://www.' + term + '.com/search?q=' + term).catch(err => 'timeout');

module.exports = Google;
