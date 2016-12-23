'use strict';

/************************************** 
 * axios http interceptor to track each request/response
 * this is just non-working code for demo, need to update
 * code for live implementation
 ***************************************/

var axios = require('axios');
var Promise = require('bluebird');

// request interceptor
axios.interceptors.request.use(function (config) {

    var token = auth.getToken();

    if (token) {
        config.headers['authorization'] = 'Bearer ' + token;
    }

    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['Expires'] = '-1';
    config.headers['Cache-Control'] = "no-cache,no-store,must-revalidate,max-age=-1,private";

    if (ie && config.method == 'get') {
        config.url = buildUrl(config.url, { timestamp: Date.now().toString() });
    }

    return config;

}, function (err) {

    return Promise.reject(err);
    });

// response interceptor
axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {

    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {

        originalRequest._retry = true;

        const refreshToken = window.localStorage.getItem('refreshToken');
        return axios.post('http://localhost:8000/auth/refresh', { refreshToken })
            .then(({data}) => {
                window.localStorage.setItem('token', data.token);
                window.localStorage.setItem('refreshToken', data.refreshToken);
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
                originalRequest.headers['Authorization'] = 'Bearer ' + data.token;
                return axios(originalRequest);
            });
    }

    return Promise.reject(error);
});



