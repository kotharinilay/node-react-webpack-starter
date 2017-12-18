'use strict';

/******************************************
 * webpack configurations for production
 * environment 
 * *****************************************/

var webpack = require('webpack');
var WebpackStrip = require('strip-loader');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {      
    entry: [
        path.resolve(process.cwd(), 'src/client/bootstrap.js')],
    output: {
        path: path.resolve(process.cwd(), 'assets/'),
        filename: 'bundle-[name].js',
        publicPath: process.env.SITE_URL +"/static/",
        chunkFilename: "[id].chunk.js"
    },
    module: {
       loaders: [
            { test: /\.json$/, loader: "json-loader" },
            {
                test: /\.js$/, loader: ['babel-loader'], exclude: /node_modules/,
                query: {
                    presets: ['react', 'es2015','stage-0'] //,'react-hmre'
                }
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
        new ExtractTextPlugin("bundle.css"),
        new webpack.DefinePlugin({
            "process.env": { NODE_ENV: '"development"' }            
        }),
        //        new webpack.optimize.DedupePlugin(),  // search for equal or similar files and deduplicate them in the output
        // new webpack.optimize.UglifyJsPlugin({ // minimize/compress all js chunks
        //     compress: { warnings: false },
        //     mangle: false,
        //     sourcemap: false,
        //     beautify: false,
        //     dead_code: true
        // })
        ]
};