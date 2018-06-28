var gcm = require('node-gcm');
var config = require('../config');
var sender = require('bluebird').promisifyAll(new gcm.Sender(config.gcm_key));

var GCM = (msg, to) =>
  await(sender.sendAsync(new gcm.Message(msg), {to}));

GCM.all = (msg, tokens) =>
  await(sender.sendAsync(new gcm.Message(msg), {registrationTokens: tokens}));

module.exports = GCM;
