var request = require('request-promise');

// Google('pizza');
Google = term => request.get('http://www.google.com/search?q=' + term).catch(err => 'timeout');

module.exports = Google;
