const {google} = require('googleapis');
const Mongo = require('../utils/Mongo');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
//const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/forms'];

/**
 * Updates values in a Spreadsheet.
 * @param {string} spreadsheetId The spreadsheet ID.
 * @param {string} range The range of values to update.
 * @param {object} valueInputOption Value input options.
 * @param {(string[])[]} _values A 2d array of values to update.
 * @return {Promise} The updated values response.
 */
async function updateValues(sheets, spreadsheetId, range, valueInputOption, values) {
  return new Promise((resolve, reject) => {
    let resource = {
      values,
    };
      sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      resource,
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Appends values in a Spreadsheet.
 * @param {string} spreadsheetId The spreadsheet ID.
 * @param {string} range The range of values to append.
 * @param {object} valueInputOption Value input options.
 * @param {(string[])[]} _values A 2d array of values to append.
 * @return {Promise} The appended values response.
 */
async function appendValues(sheets, spreadsheetId, range, valueInputOption, values) {
  return new Promise((resolve, reject) => {
    let resource = {
      values,
    };
    sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      resource,
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

var Sheet = {};

const auths = [
  new google.auth.OAuth2('854648114110-r1dgadsj1fhj3v2bdf05fkaai7454mip.apps.googleusercontent.com', 'pRrgaNwqmxfpUtn8duY20yNn', 'urn:ietf:wg:oauth:2.0:oob'),
  new google.auth.OAuth2('687385163620-gsalthsdonjmlmaf9g22ak088sn3tjap.apps.googleusercontent.com', 'NJon1K38oVNlBqfSQ6UQ9sj7', 'https://alpha.fio.one/beta/getToken'),
];

function Sheets(token) {
  var auth = auths[(token.expiry_date > 1587628496015)? 1: 0];
  auth.setCredentials(token);
  return google.sheets({version: 'v4', auth});
}

Sheet.getValues = async (token, spreadsheetId, tab, range) => {
  try {
    const sheets = Sheets(token);
    const res = await sheets.spreadsheets.values.get({spreadsheetId, range: tab + '!' + range});
    return res.data.values;
  }
  catch (e) {
    console.error(new Date(), 'Sheet.getValues error:', e);
    return false;
  }
}

Sheet.getSheets = async (token, spreadsheetId) => {
  try {
    const sheets = Sheets(token);
    const res = await sheets.spreadsheets.get({spreadsheetId, includeGridData: false});
    return res.data.sheets;
  }
  catch (e) {
    console.error(new Date(), 'Sheet.getSheets error:', e);
    return false;
  }
}

Sheet.getSheetId = async (token, spreadsheetId, tab) => {
  var sheets = await Sheet.getSheets(token, spreadsheetId);
  if (!sheets) return false;
  for (var i in sheets) {
    if (sheets[i].properties.title == tab) {
      return sheets[i].properties.sheetId;
    }
  }
  return false;
}

Sheet.addColumns = async (token, spreadsheetId, tab, columns) => {
  try {
    const sheets = Sheets(token);
    const resource = {
      requests: [
        {
          "appendDimension": {
            "sheetId": tab,
            "dimension": "COLUMNS",
            "length": columns
          }
        }
      ],
    };
    const res = await sheets.spreadsheets.batchUpdate({spreadsheetId, resource});
    return res.data;
  }
  catch (e) {
    console.error(new Date(), 'Sheet.addColumns error:', e);
    return false;
  }
}

Sheet.addColumns = async (token, spreadsheetId, tab, columns) => {
  try {
    const sheets = Sheets(token);
    const resource = {
      requests: [
        {
          "appendDimension": {
            "sheetId": tab,
            "dimension": "COLUMNS",
            "length": columns
          }
        }
      ],
    };
    const res = await sheets.spreadsheets.batchUpdate({spreadsheetId, resource});
    return res.data;
  }
  catch (e) {
    console.error(new Date(), 'Sheet.addColumns error:', e);
    return false;
  }
}

var retry = [];

Sheet.setValues = async (token, spreadsheetId, tab, range, values) => new Promise(async (resolve, reject) => {
  try {
    var result = await updateValues(Sheets(token), spreadsheetId, tab + '!' + range, 'USER_ENTERED', values);
    resolve(result);
  }
  catch (e) {
    console.error(new Date(), 'Sheet.setValues error:', e);
    retry.push({token, spreadsheetId, tab, range, values, resolve, reject})
  }
});

async function retrySetValues() {
  var task;
  try {
    while (retry.length > 0) {
      task = retry.splice(0, 1)[0];
      var result = await updateValues(Sheets(task.token), task.spreadsheetId, task.tab + '!' + task.range, 'USER_ENTERED', task.values);
      task.resolve(result);
    }
  }
  catch (e) {
    console.error(new Date(), 'Sheet.retrySetValues error:', e, task);
    retry.push(task);
  }
  setTimeout(retrySetValues, 5000);
}
setTimeout(retrySetValues, 5000);

var tasks = {};
var tokens = {};

Sheet.addValues = (token, spreadsheetId, tab, values) => new Promise(async (resolve, reject) => {
  if (!(spreadsheetId in tokens))
    tokens[spreadsheetId] = token;
  var target = spreadsheetId + '!' + tab;
  if (!(target in tasks))
    tasks[target] = [];
  tasks[target].push({values, resolve, reject});
});

async function batchAddValues() {
  for (var target in tasks) {
    const task = tasks[target];
    if (task.length == 0) continue;

    const a = target.split('!');
    const spreadsheetId = a[0];
    const tab = a[1];
    const token = tokens[spreadsheetId];
    var values = [];
    for (var i in task) {
      for (var j in task[i].values) {
        values.push(task[i].values[j]);
      }
    }
    tasks[target] = [];

    try {
      const result = await appendValues(Sheets(token), spreadsheetId, tab + '!A:ZZ', 'USER_ENTERED', values)

      for (var i in task) {
        task[i].resolve(result);
      }
    }
    catch (error) {
      console.error(new Date(), 'Sheet.batchAddValues error:', error, task);
      for (var i in task) {
        task[i].reject(error);
      }
    }
  }
  setTimeout(batchAddValues, 5000);
}
setTimeout(batchAddValues, 5000);

Sheet.getNewToken = () =>
  auths[0].generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

Sheet.getToken = async code => {
  try {
    const token = await Mongo.one('token', {code});
    if (token) return token.token;
    const result = await auths[0].getToken(code);
    await Mongo.add('token', {code, date: new Date(), token: result.tokens});
    return result.tokens;
  }
  catch (e) {
    console.log(e);
    return false;
  }
}

getColumnName = (n) => {
  if (isNaN(parseInt(n))) throw new Error('typeof n must be a number');
  let columnName = String.fromCharCode( 65 + Math.floor(n % 26));
  if (n / 26 >= 1) columnName = String.fromCharCode( 65 + Math.floor(n / 26 - 1)) + columnName;
  return columnName;
}

Sheet.range = (_x, _y) => {
  if (isNaN(_x)) throw new Error("x is NaN");
  if (isNaN(_y)) throw new Error("y is NaN");
  if (parseInt(_x) > 255) return; // only support A:ZZ
  const x = getColumnName(parseInt(_x));
  const y = parseInt(_y) + 1;
  return x + y;
}

module.exports = Sheet;
