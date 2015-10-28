var async = require('asyncawait/async');

var middleware = () =>
  (req, res, next) => {
    res.rtn = (result) => {
      if (req.query.callback)
        res.jsonp(result);
      else
        res.json(result);
    };

    res.ok = (data) =>
      res.rtn({code: 0, message: 'ok', data: data});

    res.err = (code, message, error) =>
      res.rtn({code: code, message: message, error: error});

    next();
  };

module.exports = middleware;
