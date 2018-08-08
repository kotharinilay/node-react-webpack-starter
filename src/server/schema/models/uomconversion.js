/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('uomconversion', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    FromUoMValue: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    FromUoMId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'uom',
        key: 'Id'
      }
    },
    ToUoMValue: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    ToUoMId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'uom',
        key: 'Id'
      }
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    AuditLogId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'auditlog',
        key: 'Id'
      }
    },
    IsDeleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    }
  }, {
    tableName: 'uomconversion'
  });
};
