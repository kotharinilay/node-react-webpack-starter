/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_maturity', {
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
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    MaturityName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MaturityCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NameCode: {
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
    SpeciesId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedStamp: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'view_maturity'
  });
};
