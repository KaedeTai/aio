var gcm = require('node-gcm');
var config = require('../config');
var sender = new gcm.Sender(config.gcm_key);

var GCM = async (to, title, body, icon = 'ic_launcher', data) => {
  var msg = new gcm.Message({
    priority: 'high',
    notification: {
      title,
      icon,
      body
    },
    data
  });
  return await sender.send(msg, {to});
}

GCM.all = async (tokens, title, body, icon = 'ic_launcher', data) => {
  var msg = new gcm.Message({
    priority: 'high',
    notification: {
      title,
      icon,
      body
    },
    data
  });
  return await sender.send(msg, {registrationTokens: tokens});
}

module.exports = GCM;
