require('dotenv').config();
const Get = require('../utils/Get');
const Post = require('../utils/Post');
const Patch = require('../utils/Patch');

const credentials = {
  client: {
    id: process.env.APP_ID,
    secret: process.env.APP_PASSWORD,
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: 'common/oauth2/v2.0/token'
  }
};
const oauth2 = require('simple-oauth2').create(credentials);

var Excel = {};

Excel.getValues = async (token, sheet, tab, range) => {
  const url = `https://graph.microsoft.com/v1.0/me/drive/items/${sheet}/workbook/worksheets/${tab}/range(address='${range}')`;
  try {
    const json = await Get(url, {}, {Authorization: `${token.token_type} ${token.access_token}`});
    const data = JSON.parse(json);
    console.log('Excel data:', data);
    return data.text;
  }
  catch (e) {
    console.log('Excel data error:', e);
    return false;
  }
}

Excel.setValues = async (token, sheet, tab, range, values) => {
  const url = `https://graph.microsoft.com/v1.0/me/drive/items/${sheet}/workbook/worksheets/${tab}/range(address='${range}')`;
  try {
    const json = await Patch(url, '{"values":' + JSON.stringify(values) + '}', {Authorization: `${token.token_type} ${token.access_token}`});
    const data = JSON.parse(json);
    console.log('Excel patch:', data);
    return data; 
  }
  catch (e) {
    console.log('Excel data error:', e);
    return false;
  }
}

Excel.getAuthUrl = () => {
  const returnVal = oauth2.authorizationCode.authorizeURL({
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.APP_SCOPES
  });
  console.log('getAuthUrl:', returnVal);
  return returnVal;
}

Excel.getToken = async code => {
  try {
    const token = JSON.parse(await Post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      grant_type: 'authorization_code',
      client_id: credentials.client.id,
      code,
      redirect_uri: process.env.REDIRECT_URI,
      client_secret: credentials.client.secret
    }));
    console.log('getToken:', token);
    return token;  
  }
  catch (e) {
    return e;
  }
}

/*
Excel.refreshToken = async () => {
  const token = JSON.parse(await Post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    grant_type: 'refresh_token',
    client_id: credentials.client.id,
    refresh_token: Excel.token.id_token,
    client_secret: credentials.client.secret
  }));
  Excel.token = token;
  console.log('refreshToken:', token);
  return token;
}
*/

Excel.range = (x, y) => String.fromCharCode(65 + x) + (parseInt(y) + 1);

module.exports = Excel;
