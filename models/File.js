var fs = require('bluebird').promisifyAll(require("fs"));

// file('a.txt');
File = name => fs.readFileAsync(name, 'utf8');

module.exports = File;
