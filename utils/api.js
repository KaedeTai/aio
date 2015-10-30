var app = require('express').Router();
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var check = (key, value, rule) => {
  if (Array.isArray(rule)) {
    if (rule.length > 0) {
      if (rule[0].substr) {
        // enum
        if (rule.indexOf(value) == -1)
          throw [-5, "value '" + value + "' of parameter '" + key + "' is not in ['" + rule.join("', '") + "']"];
      } else if (rule.length == 1 && Array.isArray(rule[0])) {
        // array of enum
        if (!Array.isArray(value)) 
          throw [-6, "type of parameter '" + key + "' must be array"];
        for (var i in value)
          if (rule[0].indexOf(value[i]) == -1)
            throw [-7, "value '" + value[i] + "' of parameter '" + key + "[" + i + "]' is not in ['" + rule[0].join("', '") + "']"];
      } else if (rule.length == 2) {
        // range
        if (value < rule[0] || value > rule[1])
          throw [-4, "value " + value + " of parameter '" + key + "' is not in the range of (" + rule[0] + ", " + rule[1] + ")"];
      }
    } else {
      // array
      if (!Array.isArray(value)) 
        throw [-6, "type of parameter '" + key + "' must be array"];
    }
  } else if (rule.test) {
    // regex
    if (!rule.test(value))
      throw [-3, "value '" + value + "' of parameter '" + key + "' does not match pattern " + rule];
  } else if (rule == 'date') {
    // date
    //TODO
  }
};

var api = (route, rules, func) => {
  if (typeof rules == 'function') {
    func = rules;
    rules = {};
  }

  app.get(route, async((req, res, next) => {
    res.rtn = (json) => {
      if (req.query.callback)
        res.jsonp(json);
      else
        res.json(json);
    };

    res.ok = (data) =>
      res.rtn({code: 0, message: 'ok', data: data});

    res.err = (code, message, error) =>
      res.rtn({code: code, message: message, error: error});

    try {
      req.checked = {};

      for (var key in rules) {
        // optional
        if (key == '_') {
          for (var _key in rules['_']) {
            if (_key in req.query) {
              var value = req.query[_key];
              check(_key, value, rules['_'][_key]);
              req.checked[_key] = value;
            }
          }
          continue;
        }

        var value = req.query[key];
        if (typeof value === 'undefined')
          throw [-2, "missing parameter '" + key + "'"];
        check(key, value, rules[key]);
        req.checked[key] = value;
      }

      func(req, res, next);
    } catch(e) {
      console.log(e);
      if (Array.isArray(e))
        return res.err(e[0], e[1]);
      res.err(e.code? e.code: -99, e.message? e.message: 'unknown error', e);
    }
  }));

  return app;
};

api.app = app;

module.exports = api;
