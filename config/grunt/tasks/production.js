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
        readme: build_path+ '**/*.md'    // remove all files having .md ext   
    });
    // copy required source folders
    grunt.config.set('copy', {
        main: {
            files: [
                { expand: true, src: ['.ebextensions/**'], dest: build_path },
                { expand: true, src: ['bin/**'], dest: build_path },
                { expand: true, src: ['client/views/**'], dest: build_path },
                { expand: true, src: ['assets/**'], dest: build_path },
                { expand: true, src: ['aws/**'], dest: build_path },
                { expand: true, src: ['schema/**'], dest: build_path },
                { src: ['.env'], dest: build_path },
                { src: ['package.json'], dest: build_path },
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
                'babel client --out-dir ' + build_path + 'client',
                'babel server --out-dir ' + build_path + 'server',
                'babel shared --out-dir ' + build_path + 'shared'
            ].join('&&')
        }
    });
    // create production zip from build
    grunt.config.set('compress', {
        main: {
            options: {
                archive: function() {
                    var timestamp = (require('moment')(new Date()).format('DDMMYYYY-hh.mm.ss.SSS'));
                    return dist_path + timestamp + '.zip';
                }
            },
            files: [
                { expand: true, src: '.ebextensions/*', cwd: build_path },
                { expand: true, src: '**/*', cwd: build_path }
            ]
        }
    });
};