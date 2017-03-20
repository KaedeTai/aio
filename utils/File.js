var fs = require("fs");

// File('a.txt');
File = file => fs.readFileSync(file, {encoding: 'utf8'});

// File.write('a.txt', 'abc');
File.write = (file, data) => fs.writeFileSync(file, data);

// File.rename('a.txt', 'b.txt');
File.rename = (file1, file2) => fs.renameSync(file1, file2);

module.exports = File;
