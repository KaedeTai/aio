var shell = require('python-shell').PythonShell;

var Python = (script, args, callback) => {
  var options = {
    mode: 'text',
    scriptPath: 'scripts',
    args
  };

  if (callback)
    return shell.run(script, options, callback);

  return new Promise(async (resolve, reject) => {
    try {
      shell.run(script, options, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    }
    catch (error) {
      reject(error);
    }
  });
};

module.exports = Python;
