var db = require('../db');

// User(1);
User = id => db.query('SELECT * FROM user WHERE id=?', [id]);

// User.setState(1, 'abc');
User.setState = (id, state) => db.query('UPDATE user SET state=? WHERE id=?', [state, id]);

module.exports = User;
