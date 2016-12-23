'use strict';

/******************************************
 * register grunt task for [production]
 *
 * @prod_build = copy source folders, convert from ES6 to ES5, create webpack bundle, create build zip
 * @watch_prod_build = prod_build + watch file for changes
 * @default = run prod_build as default task 
 * *****************************************/

module.exports = function(grunt) {
    // task order is important
    grunt.registerTask('prod_build',
        [
            'clean:all',
            'webpack:build',            
            'shell:prod_build',
            'copy',
            'clean:readme',
            'compress'
        ]);
    grunt.registerTask('watch_prod_build', ['prod_build', 'nodemon']);
    grunt.registerTask('default', ['prod_build']);
};