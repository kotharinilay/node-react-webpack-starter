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
var models = path.join(process.cwd(), '/src/server/schema/models');
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

db.filestorage = require('./models/filestorage')(sequelize, Sequelize);
db.species = require('./models/species')(sequelize, Sequelize);
db.breed = require('./models/breed')(sequelize, Sequelize);
db.maturity = require('./models/maturity')(sequelize, Sequelize);
db.breedtype = require('./models/breedtype')(sequelize, Sequelize);
db.uom = require('./models/uom')(sequelize, Sequelize);
db.uomconversion = require('./models/uomconversion')(sequelize, Sequelize);
db.dosebymeasure = require('./models/dosebymeasure')(sequelize, Sequelize);
db.uombymeasure = require('./models/uombymeasure')(sequelize, Sequelize);
db.company = require('./models/company')(sequelize, Sequelize);
db.contact = require('./models/contact')(sequelize, Sequelize);
db.property = require('./models/property')(sequelize, Sequelize);

db.suburb = require('./models/suburb')(sequelize, Sequelize);
db.state = require('./models/state')(sequelize, Sequelize);
db.country = require('./models/country')(sequelize, Sequelize);

db.livestock = require('./models/livestock')(sequelize, Sequelize);
db.livestockattribute = require('./models/livestockattribute')(sequelize, Sequelize);
db.enclosure = require('./models/enclosure')(sequelize, Sequelize);
db.livestockenclosurehistory = require('./models/livestockenclosurehistory')(sequelize, Sequelize);

//defined relationship between entities
db.species.belongsTo(db.filestorage, { foreignKey: 'MobIconFileId', as: 'mobPicture' });
db.species.belongsTo(db.filestorage, { foreignKey: 'IndFileIconId', as: 'indPicture' });

db.species.hasMany(db.breed, { foreignKey: 'SpeciesId', as: 'breed' });
db.species.hasMany(db.maturity, { foreignKey: 'SpeciesId', as: 'maturity' });

db.breedtype.hasMany(db.breed, { foreignKey: 'BreedTypeId', as: 'breed' });

db.uom.hasMany(db.uomconversion, { foreignKey: 'FromUoMId', as: 'uomconversion' });
db.uom.hasMany(db.uomconversion, { foreignKey: 'ToUoMId', as: 'uomconversion1' });
db.dosebymeasure.belongsTo(db.uom, { foreignKey: 'UoMId', as: 'uom' });

db.state.belongsTo(db.country, { foreignKey: 'CountryId', as: 'country' });
db.suburb.belongsTo(db.state, { foreignKey: 'StateId', as: 'state' });

db.property.belongsTo(db.filestorage, { foreignKey: 'LogoFileId', as: 'propertylogo' });
db.property.belongsTo(db.filestorage, { foreignKey: 'BrandFileId', as: 'propertybrand' });
db.property.belongsTo(db.company, { foreignKey: 'CompanyId', as: 'company' });

db.contact.belongsTo(db.company, { foreignKey: 'CompanyId', as: 'company' });
db.contact.belongsTo(db.filestorage, { foreignKey: 'AvatarFileId', as: 'avatar' });
db.contact.belongsTo(db.property, { foreignKey: 'PreferredPropertyId', as: 'property' });
db.company.belongsTo(db.filestorage, { foreignKey: 'LogoFileId', as: 'companylogo' });

db.livestock.hasMany(db.livestockenclosurehistory, { foreignKey: 'LivestockId', as: 'livestockenclosurehistory' });
db.livestock.hasMany(db.livestockattribute, { foreignKey: 'LivestockId', as: 'livestockattribute' });
db.livestock.belongsTo(db.enclosure, { foreignKey: 'CurrentEnclosureId', as: 'enclosure' });

module.exports = db;