const exec = require('child_process');

// Exec('ls');
Exec = cmd => exec.execSync(cmd, {encoding: 'utf8'});

module.exports = Exec;
