// Create app
var app = require('express').Router();
var async = require('asyncawait/async');
var await = require('asyncawait/await');

// Include models
var User = require('../models/User');
var File = require('../models/File');
var Google = require('../models/Google');

// Sample API
var i = 0;
app.get('/:id', async((req, res) => {
  // Step 1: update user state
  var id = req.params.id;
  var rs = await(User.setState(id, 'count = ' + ++ i));
  var affected = rs[0].affectedRows;
  console.log(affected);
  if (affected != 1)
    return res.send({error: 1, message: 'update user failed'});

  // Step 2: get user id, read test.txt, google pizza at the same time
  try {
    var rs = await([User(id), File('test.txt'), Google('pizza')]);
  } catch (e) {
    return res.send(e);
  }
  var result = {user: rs[0][0][0], file: rs[1], google: rs[2].length};
  console.log(result);
  res.send(result);
}));

module.exports = app;
