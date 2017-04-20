var chc = require('chromium-headless-client');
var await = require('asyncawait/await');

var Chrome = (url) => await(chc.init({url: url}));

Chrome.eval = (js) => await(chc.evaluate({expression: js}));

module.exports = Chrome;
