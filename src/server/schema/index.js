'use strict';

/**************************************
 * expose database models and sequelize instance from here
 * should be instantiate as singleton
 * ***********************************/

// load required modules
var Sequelize = require('sequelize');
var fs = require('fs');
var path = require('path');

// local variables
var db = { models: [] };

// create new connection object 
var sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_HOST_USERNAME,
    process.env.DB_HOST_PASSWORD,
    {
        logging: false,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        //query: { raw: true },
        dialectOptions: {
            multipleStatements: true
        },
        define:
        {
            timestamps: false // disabled timestamp to ignore createdAt, updatedAt fields 
        },
        pool: {
            max: 100,
            min: 1
        }
    });

// load entity files from model folder & map with database tables
var models = path.join(__dirname, '/models');
fs
    .readdirSync(models)
    .filter(function (file) {
        return (file.indexOf('.') !== 0);
    })
    .forEach(function (file) {
        var model = sequelize.import(path.join(models, file));
        db[model.name] = model;
        db.models.push(model.name);
    });

Object
    .keys(db)
    .forEach(function (model) {
        if ('associate' in db[model]) {
            db[model].associate(db);
        }
    });

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;