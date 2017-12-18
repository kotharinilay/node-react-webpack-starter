'use strict';

/******************************************
 * define grunt task for [production]
 *
 *******************************************/

module.exports = function (grunt) {

    const build_path = 'release/build/';
    const dist_path = 'release/dist/';

    // remove files and folders   
    grunt.config.set('clean', {
        all: build_path + '*',         // clean all files within build folder 
        readme: build_path + '**/*.md'    // remove all files having .md ext   
    });
    // copy required source folders
    grunt.config.set('copy', {
        main: {
            files: [
                { expand: true, src: ['src/**'], dest: build_path },
                { expand: true, src: ['assets/**'], dest: build_path },
                { expand: true, src: ['aws/**'], dest: build_path },
                { expand: true, src: ['ecosystem/client.js'], dest: build_path },
                { expand: true, src: ['ecosystem/server.js'], dest: build_path },
                { src: ['.babelrc'], dest: build_path },
                { src: ['load.env.js'], dest: build_path },
                { src: ['package.json'], dest: build_path },
                { src: ['bower.json'], dest: build_path },
            ]
        }
    });
    // execute cmd commands on the fly    
    grunt.config.set('shell', {
        options: {
            stdout: true,
            stderr: true
        },
        // convert folders to ES5 format and copy to build
        prod_build: {
            command: [
                'babel assets --out-dir ' + build_path + 'assets --presets=react,es2015,stage-0',
                'babel src --out-dir ' + build_path + 'aws --presets=react,es2015,stage-0',
                'babel src --out-dir ' + build_path + 'src --presets=react,es2015,stage-0'
            ].join('&&')
        }
    });
    // create production zip from build
    grunt.config.set('compress', {
        main: {
            options: {
                archive: function () {
                    var timestamp = (require('moment')(new Date()).format('DDMMYYYY-hh.mm.ss.SSS'));
                    return dist_path + timestamp + '.zip';
                }
            },
            files: [
                { expand: true, src: '**/*', cwd: build_path }
            ]
        }
    });
};