var DB = require('../utils/DB');

// User(1);
User = id => DB.one('SELECT * FROM user WHERE id=?', [id]);

// User.setState(1, 'abc');
User.setState = (id, state) => DB('UPDATE user SET ? WHERE ?', [{state: state}, {id: id}]);

module.exports = User;
