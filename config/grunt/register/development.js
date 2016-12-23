'use strict';

/******************************************
 * register grunt task for [development] 
 * *****************************************/

module.exports = function(grunt) {    
    grunt.registerTask('schema', ['shell:generate_schema']);
    grunt.registerTask('default', ['webpack','nodemon','watch']); };