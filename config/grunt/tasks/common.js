'use strict';


/******************************************
 * configure common grunt tasks to perform in dev and prod 
 * both environment
 * *****************************************/

module.exports = function (grunt) {
    // load tasks    
    require('load-grunt-tasks')(grunt);

    // load webpack configuration     
    var webpackConfig = require('./../../../webpack.config');

    grunt.config.set('webpack', {
        options: webpackConfig      
    });

    grunt.config.set('cssmin', {        
        target: {
            files: {
                'assets/css/app.min.css': ['assets/css/dash-table.css', 'assets/css/style.css', 'assets/css/responsive.css'],
                'assets/css/react-component.min.css': ['assets/css/react-datetime.css', 'assets/css/react-select.css']
            }
        }
    })
};