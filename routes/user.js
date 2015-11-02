// Create app
var api = require('../utils/api')('/user');
var await = require('asyncawait/await');

// Include models
var User = require('../models/User');
var FS = require('../utils/FS');
var Google = require('../utils/Google');

// Sample API
var i = 0;
api.get('/count/:id', (req, res) => {
  // Step 1: update user state
  var id = req.params.id;
  var rs = await(User.setState(id, 'count = ' + ++ i));
  console.log(rs);
  if (rs.affectedRows != 1)
    return res.err(1, 'update user failed');

  // Step 2: get user by id, read test.txt, google pizza at the same time
  var [user, file, google] = await([User(id), FS('test.txt'), Google('pizza')]);
  var result = {user: user, file: file, google: google.length};
  console.log(result);
  res.ok(result);
});

api.unit('/get', {id: 3});
api.get('/get', {id: 'user'}, (req, res) => {
  res.ok(req.user);
});

api.help('/help');
api.test('/test', 'http://localhost:3000');

module.exports = api;
