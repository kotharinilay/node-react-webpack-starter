'use strict';

/**
 * Configure Redis Caching Server
 * Set/Get methods from cache using unique key 
 */

import redis from 'redis';
import Promise from 'bluebird';
import { map as _map } from 'lodash';

// set promise for redis
Promise.promisifyAll(redis.RedisClient.prototype);

const EXPIRY_TIME = process.env.REDIS_EXPIRY_TIME;
const NODE_ENV = process.env.NODE_ENV;

// create redis client
var client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

client.on('ready', function () {
    console.log('redis is being ready >>>>>>>');
});

client.on('connect', function () {
    console.log('redis is connected >>>>>>>>');
});

client.on('reconnecting', function () {
    console.log('redis is trying to re-connect >>>>>>>');
});

client.on('error', function (e) {
    console.log('redis error >>>>> ' + e);
});

client.on('end', function (e) {
    console.log('redis connection closed >>>>>>>');
});

client.on("monitor", function (time, args, raw_reply) {
    console.log(time + ": " + args);
});

/*
client.monitor(function (err, res) {
    console.log("Entering monitoring mode.");
});
*/

// set cache value with key,expiry time
let setString = (key, value) => {
    client.set(keyWithEnv(key), value);
    client.expire(keyWithEnv(key), EXPIRY_TIME);
    return true;
}

// get value from cache using promise
let getAsync = (key) => {
    return client.getAsync(keyWithEnv(key));
}

let removeSingle = (key) => {
    client.del(keyWithEnv(key));
}

let removeArray = (keys) => {
    keys = _map(keys, function (i) {
        return keyWithEnv(i);
    });    
    client.del(keys);
}

// attach env to key to make it unique
let keyWithEnv = (key) => {
    return key + '_' + NODE_ENV;
}

module.exports = {
    setString,
    getAsync,
    removeSingle,
    removeArray
};