/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_breedtype', {
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Id: {
      type: "BINARY(16)",
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
    BreedTypeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BreedTypeName: {
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
    }
  }, {
    tableName: 'view_breedtype'
  });
};
