module.exports = function (cabloy) {
  return {
    request(options) {
      // url
      if (options.url.indexOf('/') === 0) {
        options.url = `${cabloy.config.api.baseURL}/api${options.url}`;
      }
      // jwt
      const jwt = cabloy.util.getJwtAuthorization();
      if (cabloy.data.dingtalk) {
        if (!options.headers) options.headers = {};
        options.headers.Authorization = `Bearer ${jwt}`;
      } else {
        if (!options.header) options.header = {};
        options.header.Authorization = `Bearer ${jwt}`;
      }
      // promise
      return new Promise((resolve, reject) => {
        // callback
        options.success = res => {
          // statusCode
          const _statusCode = res.statusCode || res.status;
          if (_statusCode !== 200) {
            const error = new Error();
            error.code = _statusCode;
            return reject(error);
          }
          if (res.data.code !== 0) {
            const error = new Error();
            error.code = res.data.code;
            error.message = res.data.message;
            return reject(error);
          }
          // check jwt oauth
          if (res.data['eb-jwt-oauth']) {
            cabloy.data.oauth = res.data['eb-jwt-oauth'];
          }
          resolve(res.data.data);
        };
        options.fail = err => {
          reject(err);
        };
        // request
        if (cabloy.data.dingtalk) {
          // eslint-disable-next-line
          dd.httpRequest(options);
        } else {
          wx.request(options);
        }
      });
    },
    get(url, options) {
      options = options || {};
      options.url = url;
      options.method = 'GET';
      return this.request(options);
    },
    post(url, data, options) {
      options = options || {};
      options.url = url;
      options.method = 'POST';
      options.data = data;
      return this.request(options);
    },
  };
};
