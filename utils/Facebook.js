var FB = require('bluebird').promisifyAll(require('fb'));

Facebook = () =>
  FB.apiAsync('oauth/access_token', {
    //client_id: '118842881608793',
    //client_secret: 'd1b2df713c0a71f0f0d0c8677c2bed06',
    client_id: '922570401170572',
    client_secret: 'cd8dbf6b65e08f4a728afc17d69db82b',
    grant_type: 'client_credentials'
  }).catch(err => err);

// https://developers.facebook.com/docs/graph-api/reference/user
Facebook.me = (token) =>
  FB.apiAsync('me', { fields: ['id', 'first_name', 'last_name', 'email'], access_token: token })
  .error(me => {
    if (me.error)
      throw me.error;
    return me;
  });

module.exports = Facebook;
