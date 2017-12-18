'use strict';

/******************************************
 * configure grunt tasks to perform in dev 
 * environment only
 * *****************************************/

module.exports = function (grunt) {

    // load tasks    
    grunt.loadNpmTasks('gruntify-eslint');

    // set database variables   
    var host = process.env.DB_HOST;
    var port = process.env.DB_PORT;
    var database = process.env.DB_NAME;
    var username = process.env.DB_HOST_USERNAME;
    var password = process.env.DB_HOST_PASSWORD;
    var dialect = process.env.DB_DIALECT;

    var modelsDir = './src/server/schema/models/';
    // generate database models with sequelize-auto
    var schemaCmd = 'sequelize-auto -o ' + modelsDir + ' -d ' + database + ' -h ' + host + ' -u ' + username + ' -p ' + port + ' -x ' + password + ' -e ' + dialect + '';

    // test cases with mocha
    var mochaCmd = 'mocha ./src/server/test/cases/**/*.js --compilers js:babel-core/register --bail --color'

    // code coverage with istanbul
    // For more settings check '.istanbul.yml' file
    var istanbulCmd = 'istanbul cover --color ./node_modules/mocha/bin/_mocha -- --recursive src/server/test/cases/ --compilers js:babel-core/register --color'

    // remove files and folders   
    grunt.config.set('clean', {
        all: 'assets/bundle/*'
    });
    // configure tasks
    grunt.config.set('eslint', {
        options: {
            silent: true
        },
        src: ['src/client/**/*.js', 'src/server/**/*.js', 'Gruntfile.js', 'webpack.config.js', '!public/dist/*.js']
    });
    grunt.config.set('shell', {
        options: {
            stdout: true,
            stderr: true
        },
        generate_schema: {
            command: schemaCmd
        },
        mocha: {
            command: mochaCmd
        },
        istanbul: {
            command: istanbulCmd
        },
        dev: {
            command: [
                'pm2 startOrRestart process.json',
                'webpack'
            ].join('&&')
        }
    });
};