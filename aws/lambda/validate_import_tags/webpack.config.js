'use strict';

/************************************
 * webpack configuration to build bundle of
 * external dependancy
 * ***********************************/

var webpack = require('webpack');
var path = require('path');
var fs = require('fs')

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    target: 'node',
    entry: './entrypoints.js',
    externals: nodeModules,

    output: {
        path: path.resolve(process.cwd(), 'repo/'),
        filename: "repository.js",
        libraryTarget: 'commonjs2'
    },
    module: {
        loaders: [
            { test: /\.json$/, loader: "json-loader" },
            {
                test: /\.js$/, loader: ['babel-loader?presets[]=es2015,presets[]=stage-0'], exclude: /(node_modules)/
            }
        ]
    },
};