// Create app
var app = require('express').Router();
var async = require('asyncawait/async');
var await = require('asyncawait/await');

// Include models
var User = require('../models/User');
var File = require('../utils/File');
var Google = require('../utils/Google');

// Sample API
var i = 0;
app.get('/:id', async((req, res) => {
  // Step 1: update user state
  var id = req.params.id;
  var rs = await(User.setState(id, 'count = ' + ++ i));
  console.log(rs);
  if (rs.affectedRows != 1)
    return res.send({error: 1, message: 'update user failed'});

  // Step 2: get user by id, read test.txt, google pizza at the same time
  try {
    var [user, file, google] = await([User(id), File('test.txt'), Google('pizza')]);
  } catch (e) {
    return res.send(e);
  }
  var result = {user: user, file: file, google: google.length};
  console.log(result);
  res.send(result);
}));

module.exports = app;
