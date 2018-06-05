var async = require('asyncawait/async');
var await = require('asyncawait/await');
var config = require('./config');
//var User = require('./models/User');
var Mongo = require('./utils/Mongo');
var Get = require('./utils/Get');
var Post = require('./utils/Post');
var File = require('./utils/File');

Object.toArray = o => Object.keys(o).map(x => o[x]);
Array.toDict = (arr, key = 'id') => {var o = {}; for (var i in arr) o[arr[i][key]] = arr[i]; return o;};

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
  async((req, res, next) => {
    res.rtn = (json) => {
      if (req.query.callback)
        res.jsonp(json);
      else
        res.json(json);
    };

    res.render = (data, file, cache) => {
      var values = [];
      for (var key in data) {
        var json = JSON.stringify(data[key]);
        while (json.match(/<\/?script[^>]*>/i)) {
          json = json.replace(/<\/?script[^>]*>/ig, '');
        }
        values.push('data.' + key + ' = ' + json + ';');
      }
      var html = File(file).replace('//data//', values.join('\n'));
      html = html.replace('//facebook//', File('public/js/fb.js'));
      if (req.user && req.user.en)
        html = html.replace(/\/assets\/images\//g, '/assets/images/english/');
      if (cache)
        File.write(config.cache + '/' + cache, html);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(html);
    }

    res.facebook = (data, file, og, cache) => {
      var values = [];
      for (var key in data) {
        var json = JSON.stringify(data[key]);
        while (json.match(/<\/?script[^>]*>/i)) {
          json = json.replace(/<\/?script[^>]*>/ig, '');
        }
        values.push('data.' + key + ' = ' + json + ';');
      }
      var html = File(file).replace('//data//', values.join('\n'));
      html = html.replace('//facebook//', File('public/js/fb.js'));
      //if (req.user && req.user.en) html = html.replace(/\/assets\/images\//g, '/assets/images/english/');
      html = html.replace(/=og:title/, og.title);
      html = html.replace(/=og:description/, og.description);
      html = html.replace(/=og:url/, og.url);
      html = html.replace(/=og:image/, og.image);
      if (cache)
        File.write(config.cache + '/' + cache, html);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(html);
    }


    res.ok = (data) =>
      res.rtn({code: 0, message: 'ok', data: data});

    res.err = (code, message, error) =>
      res.rtn({code: code, message: message, error: error});

    try {
      req.checked = {};

      var query = (req.method == 'POST')? req.body: req.query;
      for (var key in rules) {
        // login
        if (key == '$') { // [type, level, other]
          if (rules[key] == 1) {
            if (!req.signedCookies.user_id) throw [-1, '請重新登入！'];
            req.user = Mongo.get('user', parseInt(req.signedCookies.user_id));
            req.user.en = !/zh-TW/i.test(req.headers['accept-language']);
          }
          else {
            if (!req.signedCookies.admin) throw [-1, '請重新登入！'];
          }
          //req.user = {_id: 1, name: '戴志洋', image: {url: '/assets/images/default.jpg', imgCheck: 'N', imgMemo: ''}};
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
          // get user from token
          req.user = User.token(value);
          if (!req.user) throw [-1, '請重新登入！'];
        }
        else {
          check(key, value, rules[key], query);
          req.checked[key] = value;
        }
      }

      func(req, res, next);
    } catch(e) {
      console.log(e);
      return res.err(-99, '系統忙碌中請稍候');
      if (Array.isArray(e))
        return res.err(e[0], e[1]);
      res.err(e.code? e.code: -99, e.message? e.message: 'unknown error', e);
    }
  });

var api = base => {
  api = require('express').Router();
  api._get = api.get;
  api._post = api.post;

  var help = {};
  var unit = {};

  api.get = (route, rules, func) => {
    if (typeof rules == 'function') {
      func = rules;
      rules = {};
    }
    help[base + route] = {get: rules};
    api._get(route, callback(rules, func));
    return api;
  };

  api.post = (route, rules, func) => {
    if (typeof rules == 'function') {
      func = rules;
      rules = {};
    }
    help[base + route] = {post: rules};
    api._post(route, require('connect-multiparty')(), callback(rules, func));
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
    api._get(route, async((req, res) => {
      var Jobs = {};
      var http = Post.json;
      for (var path in unit)
        if (unit[path].length == 1)
          Jobs[base + path] = http(config.uri + base + path, unit[path][0]);
        else
          for (var i in unit[path])
            Jobs[base + path + ':' + i] = http(config.uri + base + path, unit[path][i]);
      res.json(await(Jobs));
    }));
    return api;
  };

  return api;
};

module.exports = api;
