// Create app
var app = require('express').Router();
var api = require('../utils/api');
var await = require('asyncawait/await');

// Include models
var User = require('../models/User');
var FS = require('../utils/FS');
var Google = require('../utils/Google');

// Sample API
var i = 0;
app.get('/:id', api((req, res) => {
  // Step 1: update user state
  var id = req.params.id;
  var rs = await(User.setState(id, 'count = ' + ++ i));
  console.log(rs);
  if (rs.affectedRows != 1)
    return res.err(1, 'update user failed');

  // Step 2: get user by id, read test.txt, google pizza at the same time
  try {
    var [user, file, google] = await([User(id), FS('test.txt'), Google('pizza')]);
  } catch (e) {
    return res.err(-1, 'unknown error', e);
  }
  var result = {user: user, file: file, google: google.length};
  console.log(result);
  res.ok(result);
}));

module.exports = app;
