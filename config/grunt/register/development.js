'use strict';

/******************************************
 * register grunt task for [development] 
 * *****************************************/

module.exports = function (grunt) {
    grunt.registerTask('schema', ['shell:generate_schema']);
    grunt.registerTask('test', ['shell:mocha']);
    grunt.registerTask('coverage', ['shell:istanbul']);
    grunt.registerTask('default', ['shell:dev'])
};