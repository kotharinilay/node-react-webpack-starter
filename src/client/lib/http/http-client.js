'use strict';

/************************************** 
 * track http requests/responses
 ***************************************/

import axios from 'axios';
import Promise from 'bluebird';
import { loggedIn, logout, getToken, getRememberMe } from './token-management';

export default class HttpClient {

    constructor() {
        this.loadingProgress = 0;
        this.disconnected = false;
        this.deferredAxiosCalls = [];
        this.axiosInstances = [];
        this.defaultInstance = null;
    }

    // set header for request such as auth token
    setRequestHeader = (config) => {
        if (loggedIn() && !config.headers.AWS) {
            config.headers.Authorization = 'Bearer ' + getToken();
            config.headers.RememberMe = getRememberMe();
        }
        config.headers['Accept-Language'] = 'en';
        config.headers.Expires = '-1';
        config.headers['Cache-Control'] = "no-cache,no-store,must-revalidate,max-age=-1,private";
        return config;
    }

    // increase counter on each API request
    increament = (param) => {
        if (this.loadingProgress === 0) // $(".app-init-loader").show(); ;
            this.loadingProgress += 1;
        return this.setRequestHeader(param);
    }

    // decrease counter upon receiving response
    decreament = (param) => {
        if (this.disconnected === true)
            this.disconnected = false;
        var response = param.status ? param : param.response;
        this.loadingProgress -= 1;
        if (this.loadingProgress === 0) {
            // hide app loader here
        }
        return param;
    }

    // error received from API response
    error = (param) => {
        this.loadingProgress -= 1
        if (this.loadingProgress === 0) {
            // hide app loader here
        }

        if (param.message === 'Network Error') {
            if (this.disconnected === false)
                this.disconnected = true;
            // Add current axios call to deferred because network is offline
            this.deferredAxiosCalls.push(param.config);
            this.openModal('Network Error', 'Unable to connect to Aglive server.')
            param.response = {
                data: {
                    success: false, unauthorized: true, error: 'Network Error'
                }
            }
        } else {
            // Those are 4xx and 5xx errors, not disconnects, and should not be retried
            if (this.disconnected === true)
                this.disconnected = false;
            var response = param.response;


            if (param.response.status == 400) {
                param.response.data.badRequest = true;
            }

            // Handle Unauthorized error
            if (param.response.data == 'Unauthorized') {
                logout();
                this.openModal('Session Expired', 'Your session has been expired. Please log in again to continue.')
                param.response.data = {
                    success: false,
                    unauthorized: true,
                    error: 'COMMON.UNAUTHORIZED'
                }
            }
        }
        return Promise.reject(param);
    }

    setDefaultInstance = (axiosInstance) => {
        this.defaultInstance = axiosInstance;
    }

    register = (axiosInstance) => {
        this.axiosInstances.push(axiosInstance);
        axiosInstance.interceptors.request.use(this.increament, this.error);
        axiosInstance.interceptors.response.use(this.decreament, this.error);
    }

    request = (config) => {
        return (config.instance || this.defaultInstance || axios).request(config);
    }

    retry = () => {
        while (this.deferredAxiosCalls.length) {
            const cfg = this.deferredAxiosCalls.shift();
            this.request(cfg);
        }
    }

    openModal = (title, message) => {
        $("#global_modal .modal-title").html(title);
        $("#global_modal .modal-body").html(message);
        $("#global_modal").modal('show');
    }
}