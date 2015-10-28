var async = require('asyncawait/async');

var api = (func) =>
  async((req, res, next) => {
    try {
      func(req, res, next);
    } catch(e) {
      console.log(e);
      err(res, -1, 'unknown error', e);
    }
  });

module.exports = api;
