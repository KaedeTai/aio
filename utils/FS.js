var fs = require('bluebird').promisifyAll(require("fs"));

// FS('a.txt');
FS = name => fs.readFileAsync(name, 'utf8');

module.exports = FS;
