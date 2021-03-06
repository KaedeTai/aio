var config = require('./config');
var FS = require('./utils/FS');
var Mongo = require('./utils/Mongo');
var Get = require('./utils/Get');
var Post = require('./utils/Post');

Object.toArray = o => Object.keys(o).map(x => o[x]);
Array.toDict = (arr, key = 'id') => {var o = {}; for (var i in arr) o[arr[i][key]] = arr[i]; return o;};
Object.defineProperty(global, '__stack', {
  get: function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
      return stack;
    };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});
Object.defineProperty(global, '__line', {
  get: function() {
    return __stack[1].getLineNumber();
  }
});
Object.defineProperty(global, '__function', {
  get: function() {
    return __stack[1].getFunctionName();
  }
});
global.__aio_err = (_function, _filename, _line) => {
    return `    at ${_function} (${_filename}:${_line})`;
};

var dump = i => {
  var o = {};
  for (k in i) {
    if (i[k].test)
      o[k] = '' + i[k];
    else if (Array.isArray(i[k]))
      o[k] = i[k];
    else if (typeof i[k] == 'object')
      o[k] = dump(i[k]);
    else
      o[k] = i[k];
  }
  return o;
};

var check = (key, value, rule, query) => {
  if (Array.isArray(rule)) {
    if (rule.length > 0) {
      if (rule[0].substr) {
        // enum
        if (rule.indexOf(value) == -1)
          throw [-4, "value '" + value + "' of parameter '" + key + "' is not in ['" + rule.join("', '") + "']"];
      } else if (rule.length == 1 && Array.isArray(rule[0])) {
        // array of enum
        if (!Array.isArray(value))
          throw [-5, "type of parameter '" + key + "' must be array"];
        for (var i in value)
          if (rule[0].indexOf(value[i]) == -1)
            throw [-6, "value '" + value[i] + "' of parameter '" + key + "[" + i + "]' is not in ['" + rule[0].join("', '") + "']"];
      } else if (rule.length == 2) {
        // range
        value = parseInt(value);
        if (value < rule[0] || value > rule[1])
          throw [-3, "value " + value + " of parameter '" + key + "' is not in the range of (" + rule[0] + ", " + rule[1] + ")"];
        query[key] = value;
      }
    } else {
      // array
      if (!Array.isArray(value))
        throw [-5, "type of parameter '" + key + "' must be array"];
    }
  } else if (rule.test) {
    // regex
    if (!rule.test(value))
      throw [-7, "value '" + value + "' of parameter '" + key + "' does not match pattern " + rule];
  } else if (rule == 'int' || rule === parseInt(rule)) {
    // int
    if (isNaN(parseInt(value)))
      throw [-8, "value '" + value + "' of parameter '" + key + "' is not an integer"];
    query[key] = parseInt(value);
  } else if (rule == 'float' || rule === parseFloat(rule)) {
    // float
    if (isNaN(parseFloat(value)))
      throw [-8, "value '" + value + "' of parameter '" + key + "' is not an float"];
    query[key] = parseFloat(value);
  } else if (rule === Object(rule)) {
    // object
    if (value !== Object(value))
      throw [-9, "value '" + value + "' of parameter '" + key + "' is not an object"];
  } else if (rule == 'date') {
    // date
    //TODO
  } else if (rule == '') {
    // any
  }
};

var callback = (rules, func) =>
  async (req, res, next) => {
    // write API log
    var writeLog = log => {
      // ignore local test
      if (req.ip == '::1') return;

      // send API log to logger asynchronously
      Post.json(config.logger_url, Object.assign({
        ip: req.ip,
        host: req.hostname,
        base: req.baseUrl,
        url: req.originalUrl,
        path: req.path,
        method: req.method,
        query: req.query,
        body: req.body,
        signedCookies: req.signedCookies,
        //session: req.sessoin.toJSON(),
        session: req.session || null,
        headers: req.headers,
        date: new Date(),
      }, log)).catch(e => e);
    };

    res.rtn = (json) => {
      if (req.query.callback) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        res.jsonp(json);
      } else {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.json(json);
      }
    };

    res.data = (data, file, cache) => {
      writeLog({type: 'data', data, file});

      var values = [];
      for (var key in data) {
        var json = JSON.stringify(data[key]);
        values.push('data.' + key + ' = ' + json + ';');
      }
      var html = FS(file).replace('//data//', values.join('\n'));
      if (cache)
        FS.write(config.cache + '/' + cache, html);
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      res.end(html);
    }

    res.render = (data, file, cache) => {
      writeLog({type: 'render', data, file});

      var values = [];
      for (var key in data) {
        var json = JSON.stringify(data[key]);
        if (data[key]) {
          while (json.match(/<\/?script[^>]*>/i)) {
            json = json.replace(/<\/?script[^>]*>/ig, '');
          }
        }
        values.push('data.' + key + ' = ' + json + ';');
      }
      var html = FS(file).replace('//data//', values.join('\n'));
      //html = html.replace('//facebook//', FS('public/js/fb.js'));
      if (req.user && req.user.en)
        html = html.replace(/\/assets\/images\//g, '/assets/images/english/');
      if (cache)
        FS.write(config.cache + '/' + cache, html);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(html);
    }

    res.facebook = (data, file, og, cache) => {
      writeLog({type: 'facebook', data, file, og});

      var values = [];
      for (var key in data) {
        var json = JSON.stringify(data[key]);
        while (json.match(/<\/?script[^>]*>/i)) {
          json = json.replace(/<\/?script[^>]*>/ig, '');
        }
        values.push('data.' + key + ' = ' + json + ';');
      }
      var html = FS(file).replace('//data//', values.join('\n'));
      //html = html.replace('//facebook//', FS('public/js/fb.js'));
      //if (req.user && req.user.en) html = html.replace(/\/assets\/images\//g, '/assets/images/english/');
      html = html.replace(/=og:title/, og.title);
      html = html.replace(/=og:description/, og.description);
      html = html.replace(/=og:url/, og.url);
      html = html.replace(/=og:image/, og.image);
      if (cache)
        FS.write(config.cache + '/' + cache, html);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(html);
    }

    res.ok = (data) => {
      writeLog({type: 'ok', data});

      res.rtn({code: 0, message: 'ok', data: data});
    };

    res.err = (code, message, error) => {
      writeLog({type: 'error', code, message, error});

      res.rtn({code: code, message: message, error: error});
    };

    try {
      req.checked = {};

      var query = (req.method == 'POST')? req.body: req.query;
      for (var key in rules) {
        // login
        if (key == '$') { // require user login
          if (rules[key] == 'user') {
            // get user from session_key
            var session = await Mongo.one('session', {session_key: req.session.key});
            if (!session) return res.redirect('/token/user_login?redirect=' + encodeURIComponent(req.originalUrl));
            req.user = session.user;
          }
          continue;
        }
        // optional
        if (key == '_') {
          for (var _key in rules['_']) {
            if (_key in query) {
              var value = query[_key];
              check(_key, value, rules['_'][_key], query);
              req.checked[_key] = value;
            }
          }
          continue;
        }

        if (rules[key] == 'file') {
          if (!req.files[key])
            throw [-10, "missing file '" + key + "'"];
          continue;
        }

        var value = query[key];
        if (typeof value === 'undefined')
          throw [-2, "missing parameter '" + key + "'"];

        if (rules[key] == 'user') {
          // update session_key if provided
          if (value) req.session.key = value;

          // get user from session_key
          var session = await Mongo.one('session', {session_key: req.session.key});
          if (!session) throw [-1, 'Please login again!'];
          req.user = session.user;
          if (session.appID) req.appID = session.appID;
        }
        else {
          check(key, value, rules[key], query);
          req.checked[key] = value;
        }
      }

      func(req, res, next);
    } catch(e) {
      console.log(e);
      //return res.err(-99, '系統忙碌中請稍候');
      if (Array.isArray(e))
        return res.err(e[0], e[1]);
      res.err(e.code? e.code: -99, e.message? e.message: 'unknown error', e);
    }
  };

var api = base => {
  api = require('express').Router();
  api._get = api.get;
  api._post = api.post;
  api._put = api.put;
  api._delete = api.delete;

  var help = {};
  var unit = {};

  api.get = (route, rules, func) => {
    if (typeof rules == 'function') {
      func = rules;
      rules = {};
    }
    help['GET ' + base + route] = rules;
    api._get(route, callback(rules, func));
    return api;
  };

  api.post = (route, rules, func) => {
    if (typeof rules == 'function') {
      func = rules;
      rules = {};
    }
    help['POST ' + base + route] = rules;
    api._post(route, require('connect-multiparty')(), callback(rules, func));
    return api;
  };

  api.put = (route, rules, func) => {
    if (typeof rules == 'function') {
      func = rules;
      rules = {};
    }
    help['PUT ' + base + route] = rules;
    api._put(route, require('connect-multiparty')(), callback(rules, func));
    return api;
  };

  api.delete = (route, rules, func) => {
    if (typeof rules == 'function') {
      func = rules;
      rules = {};
    }
    help['DELETE + ' + base + route] = rules;
    api._delete(route, callback(rules, func));
    return api;
  };

  api.help = (route) => {
    api._get(route, (req, res) => res.json(dump(help)));
    return api;
  };

  api.unit = (route, qs) => {
    if (!unit[route])
      unit[route] = [];
    unit[route].push(qs);
    return api;
  };

  api.test = (route) => {
    api._get(route, async (req, res) => {
      var Jobs = {};
      var http = Post.json;
      for (var path in unit)
        if (unit[path].length == 1)
          Jobs[base + path] = await http(process.env.URI + base + path, unit[path][0]);
        else
          for (var i in unit[path])
            Jobs[base + path + ':' + i] = await http(process.env.URI + base + path, unit[path][i]);
      res.json(Jobs);
    });
    return api;
  };

  return api;
};

module.exports = api;
