/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_uomconversion', {
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    AuditLogId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    FromLanguage: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    ToLanguage: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    FromUoM: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ToUoM: {
      type: DataTypes.STRING,
      allowNull: true
    },
    FromUoMValue: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    FromUoMId: {
      type: "BINARY(16)",
      allowNull: false
    },
    ToUoMValue: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    ToUoMId: {
      type: "BINARY(16)",
      allowNull: false
    },
    CreatedStamp: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'view_uomconversion'
  });
};
