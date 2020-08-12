'use strict';

const app = require('commander');
const gpg = require('./gpg');

app
  .version(require('../package.json').version, '-V, --version')
  .option('-v, --verbose', 'shows you every single step');

app
  .command('list')
  .description('list all keys from the gpg keyring')
  .action(() => {
    gpg.list().then(result => {
      console.log(result);
    });
  });

app
  .command('info [email]')
  .description('lists a key with a given email address')
  .action(email => {
    gpg.info(email).then(res => {
      console.log(res);
    });
  });

app.parse(process.argv);

if (!app.args.length) app.help();