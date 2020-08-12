const sgMail = require('@sendgrid/mail');
const config = require('../config');

sgMail.setApiKey(config.sendgrid.api_key);

var SendGrid = {};

/*
var mail = {
  to,
  cc,
  bcc,
  from,
  subject,
  text,
  html,
}
*/
SendGrid.send = async (mail) => {
  try {
    return await sgMail.send(mail);
  }
  catch (e) {
    console.log('sgMail error', e);
  }
};

module.exports = SendGrid;
