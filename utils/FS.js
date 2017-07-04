var fs = require("fs");

// FS('a.txt');
FS = file => fs.readFileSync(file, {encoding: 'utf8'});

// FS.write('a.txt', 'abc');
FS.write = (file, data, type) => fs.writeFileSync(file, data, type);

// FS.rename('a.txt', 'b.txt');
FS.rename = (file1, file2) => fs.renameSync(file1, file2);

// FS.exists('a.txt');
FS.exists = (file) => fs.existsSync(file);

module.exports = FS;
