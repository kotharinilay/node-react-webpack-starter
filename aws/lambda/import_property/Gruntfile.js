'use strict';

/************************************* 
 * GruntJS configuration
 * Description:
 * Task configuration to perform actions such as 
 *  1. Copy dependant files from root folder
 *  2. Delete dependant files
 *  3. Execute lambda function
 *  4. Create package of source and deploy to aws
***************************************/

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    //configure the lambda grunt object
    grunt.initConfig({
        webpack: {
            dist: require("./webpack.config.js")
        },
        copy: {
            lambda: {
                files: [
                    { src: '../load.env.js', dest: 'src/load.env.js' },
                    { expand: true, cwd: '../../../src/server/schema/models', src: ['**/*'], dest: 'src/server/schema/models' },
                ]
            }
        },
        clean: {
            lambda: ['src', 'dist']
        },
        // invoke lamda handler
        lambda_invoke: {
            default: {
                handler: 'handler',
                file_name: 'index.js'
            }
        },
        // create zipped package for deployment
        lambda_package: {
            default: {
                // include_files: ['.env']
            }
        },
        // deploy package file to aws lamda
        lambda_deploy: {
            default: {
                arn: 'arn:aws:lambda:ap-southeast-2:027433987909:function:import-property',
                options: {
                    region: 'ap-southeast-2',
                    accessKeyId: 'AKIAISARQPKIIRYVBMZA',
                    secretAccessKey: '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'
                }
            }
        },
    });

    // configure bunch of commands to be executed
    // grunt.registerTask('test', ['copy:lambda', 'jshint:all', 'mochaTest']);
    grunt.registerTask('default', ['lambda_invoke']);
    grunt.registerTask('load', ['webpack', 'copy:lambda']);
    grunt.registerTask('run', ['webpack', 'copy:lambda', 'lambda_invoke']);
    grunt.registerTask('package', ['webpack', 'copy:lambda', 'lambda_package', 'clean:lambda']);
    grunt.registerTask('deploy', ['webpack', 'copy:lambda', 'lambda_package', 'lambda_deploy', 'clean:lambda']);
};
