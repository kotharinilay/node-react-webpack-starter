/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_speciestype', {
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    AuditLogId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SpeciesTypeLanguage: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    SpeciesTypeName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SpeciesTypeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SpeciesLanguage: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    SpeciesName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SpeciesNameCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedStamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    SpeciesId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'view_speciestype'
  });
};
