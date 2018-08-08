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
    // require('../../../load.env')();

    require('load-grunt-tasks')(grunt);

    //configure the lambda grunt object
    grunt.initConfig({
        copy: {
            lambda: {
                files: [
                    { src: '../load.env.js', dest: 'src/load.env.js' },
                    { src: '../../../src/shared/format/string.js', dest: 'src/validateString.js' }
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
                arn: 'arn:aws:lambda:ap-southeast-2:027433987909:function:remove-duplicate-deceased',
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
    grunt.registerTask('run', ['copy:lambda', 'lambda_invoke', 'clean:lambda']);
    grunt.registerTask('package', ['copy:lambda', 'lambda_package', 'clean:lambda']);
    grunt.registerTask('deploy', ['copy:lambda', 'lambda_package', 'lambda_deploy', 'clean:lambda']);
};
