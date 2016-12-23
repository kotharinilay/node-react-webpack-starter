'use strict';

/******************************************
 * webpack configurations for development
 * environment 

 * *****************************************/

var webpack = require('webpack');
var path =require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
      stats: { colors: true },
      entry: [
         // 'webpack-hot-middleware/client',
          path.resolve(process.cwd(), 'src/client/bootstrap.js')],    
     output: {
            path: path.resolve(process.cwd(), 'assets/'),
            filename: 'bundle-[name].js',
            publicPath: "static/",
            chunkFilename: "[id].[hash].chunk.js"
        },
    module: {
        loaders: [
            { test: /\.json$/, loader: "json-loader" },
            {
                test: /\.js$/, loader: ['babel-loader'], exclude: /node_modules/, 
                query: {
                   presets: ['react', 'es2015'] //,'react-hmre'
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
    watch: true,    
    plugins: [
            //new webpack.HotModuleReplacementPlugin(),
            new ExtractTextPlugin("bundle.css")            ,    
            new webpack.DefinePlugin({"process.env": {NODE_ENV: '"development"'}}),
        ],
    resolve: {
            alias: {
                jquery: '../../bower_components/jquery/dist/jquery.min',
                jQuery: '../../bower_components/jquery/dist/jquery.min',
                $: '../../bower_components/jquery/dist/jquery.min'
            }
        }
};