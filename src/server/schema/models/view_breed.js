/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_breed', {
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    BreedCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BreedName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NameCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AuditLogId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedStamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    SpeciesName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BreedTypeName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BreedTypeId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SpeciesId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'view_breed'
  });
};
