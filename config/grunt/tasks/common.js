'use strict';


/******************************************
 * configure common grunt tasks to perform in dev and prod 
 * both environment
 * *****************************************/

module.exports = function(grunt) {     
    // load tasks    
    require('load-grunt-tasks')(grunt);

    // load webpack configuration     
    var webpackConfig = require('./../../../webpack.config');
    
    grunt.config.set('webpack', {
        options: webpackConfig,
        build: {
            plugins: webpackConfig.plugins
        }
    });      
};