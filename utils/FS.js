var fs = require("fs");

// FS('a.txt');
FS = file => fs.readFileSync(file, {encoding: 'utf8'});

// FS.write('a.txt', 'abc');
FS.write = (file, data) => fs.writeFileSync(file, data);

// FS.rename('a.txt', 'b.txt');
FS.rename = (file1, file2) => fs.renameSync(file1, file2);

module.exports = FS;
