'use strict';

/******************************************
 * webpack configurations for development
 * environment 
 * *****************************************/

var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var CompressionPlugin = require("compression-webpack-plugin");

module.exports = {    
    cache: true,
    watch: true,
    stats: { colors: true },
    entry: [
        path.resolve(process.cwd(), 'src/client/bootstrap.js')
    ],
    output: {
        path: path.resolve(process.cwd(), 'assets/'),
        filename: 'bundle-[name].js',
        publicPath: process.env.SITE_URL + "/static/",
        chunkFilename: "[id].chunk.js"
    },
    module: {
        loaders: [
            { test: /\.json$/, loader: "json-loader" },
            {
                test: /\.js$/, loader: ['babel-loader'], exclude: /(node_modules|bower_components)/,
                query: { cacheDirectory: true, presets: ['react', 'es2015', 'stage-0'] }
            },
            { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader") },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
            { test: /\.(woff|woff2)$/, loader: "file-loader" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
            { test: /\.ico(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" }
        ]
    },
    plugins: [
        new BrowserSyncPlugin({
            codeSync: true,               // send file changes to connected browsers and reload
            proxy: process.env.SITE_URL,  // local node app address            
            port: 3000,                   // *different* port than abovey
            notify: true,
            open: 'external',             // open with ip or localhost
            files: [path.resolve(process.cwd(), 'src/client/**')]
        }),
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$/,
            minRatio: 0.8
        }),
        new ExtractTextPlugin("bundle.css"),
        new webpack.DefinePlugin({
            "process.env": { NODE_ENV: '"development"' }
        })
    ]
};