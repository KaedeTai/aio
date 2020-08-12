var config = require('../config');
var request = require('request-promise');
var Get = require('../utils/Get');
var Post = require('../utils/Post');

var SMS = async (mobile, message) => {
  if (mobile.match(/^86/)) {
    let response = await Post.json(
      'https://api.sms.jpush.cn/v1/codes',
      {mobile: mobile.substring(2), temp_id: 1},
      {'Content-Type': 'application/json', 'Authorization': config.jsms.auth}
    );
    return response;
  }
  else {
    let msg = 'username='+config.sms.username+'&password='+config.sms.password+'&mobile='+mobile+'&message='+encodeURIComponent(message);
    let url = 'http://api.twsms.com/json/sms_send.php?'+msg;
    var response = await Get.json(url)
    return response;
  }
};

SMS.verify = async (msg_id, code) => {
  try {
    let response = await Post.json(
      'https://api.sms.jpush.cn/v1/codes/' + msg_id + '/valid',
      {code},
      {'Content-Type': 'application/json', 'Authorization': config.jsms.auth}
    );
    return response;
  } catch (e) {
    return e.error;
  }
};

module.exports = SMS;
