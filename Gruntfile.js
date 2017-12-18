'use strict';

/******************************************
 * Grunt configuration 
 * load and register tasks based on environment
 * *****************************************/

module.exports = function(grunt) {    

    // set environment mode    
    require('./load.env')();
    
    const env = process.env.NODE_ENV;

    // load module    
    function loadTasks(relpath) {        
        var func = require(relpath)(grunt);
        return func;
    }

    // configure tasks to grunt object    
    function invokeConfig(grunt, tasks) {
        for (let taskName in tasks) {
            console.log(taskName);
            if (tasks.hasOwnProperty(taskName)) {
                tasks[taskName](grunt);
            }
        }
    }
    console.log('./config/grunt/tasks/'+ env);
    // load tasks per environment    
    let commonTasks = loadTasks('./config/grunt/tasks/common') ;    
    let mainTasks = loadTasks('./config/grunt/tasks/'+ env); 
    
    invokeConfig(grunt, commonTasks);    
    invokeConfig(grunt, mainTasks);
    
    // register tasks
    loadTasks('./config/grunt/register/' + env);
};