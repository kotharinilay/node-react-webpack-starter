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
    
    var modelsDir = './src/schema/models/';
    // generate database models with sequelize-auto
    var schemaCmd = 'sequelize-auto -o ' + modelsDir + ' -d ' + database + ' -h ' + host + ' -u ' + username + ' -p ' + port + ' -x ' + password + ' -e ' + dialect + '';

      // remove files and folders   
    grunt.config.set('clean', {
        all: 'assets/bundle/*'
    });
    // configure tasks    
    grunt.config.set('nodemon', {
        dev: {
            script: 'src/server/development.js'
        }
    });    
    // configure tasks
    grunt.config.set('eslint', {
        options: {
            silent: true
        },
        src: ['src/client/**/*.js', 'src/server/**/*.js', 'Gruntfile.js', 'webpack.config.js', '!public/dist/*.js']
    });
    grunt.config.set('watch', {
        app: {
            files: ['src/client/**/*', 'webpack.config.js', 'Gruntfile.js'],
            tasks: ['webpack:build'],
            options: {
                spawn: false,
            }
        }
    });
    grunt.config.set('shell', {
        options: {
            stdout: true,
            stderr: true
        },
        generate_schema: {
            command: schemaCmd
        }        
    });
};