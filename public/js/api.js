var api = function (url, data, succeed, failed) {
  axios.post(url, data).then(function (result) {
    if (result.data.code == 0) return succeed? succeed(result.data.data): true;
    if (failed) return failed(result);
    // alert(result.data.message);
    return false;
  }).catch(function (error) {
    if (failed) return failed(error);
    alert(error);
    return false;
  });
}
api.put = function (url, data, succeed, failed) {
  axios.put(url, data).then(function (result) {
    if (result.data.code == 0) return succeed? succeed(result.data.data): true;
    if (failed) return failed(result);
    // alert(result.data.message);
    return false;
  }).catch(function (error) {
    if (failed) return failed(error);
    alert(error);
    return false;
  });
}
api.get = function (url, data, succeed, failed) {
  axios.get(url, data).then(function (result) {
    if (result.data.code == 0) return succeed? succeed(result.data.data): true;
    if (failed) return failed(result);
    // alert(result.data.message);
    return false;
  }).catch(function (error) {
    if (failed) return failed(error);
    alert(error);
    return false;
  });
}

function get(key, value) {
  if (!localStorage[key]) localStorage[key] = JSON.stringify(value);
  return JSON.parse(localStorage[key]);
}

function set(key, value) {
  localStorage[key] = JSON.stringify(value);
}

function dict(arr, key = '_id') {
  var o = {};
  for (var i in arr) o[arr[i][key]] = arr[i];
  return o;
}

function loadScript(url, callback) {
  // Adding the script tag to the head as suggested before
  var head = document.head;
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;

  // Then bind the event to the callback function.
  // There are several events for cross browser compatibility.
  script.onreadystatechange = callback;
  script.onload = callback;

  // Fire the loading
  head.appendChild(script);
}
