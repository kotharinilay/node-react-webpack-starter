/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('enclosure', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    EnclosureTypeId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'enclosuretype',
        key: 'Id'
      }
    },
    PropertyId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DefaultGPS: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Area: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    UoMId: {
      type: "BINARY(16)",
      allowNull: true
    },
    DSE: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    EnclosureFence: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IsDeleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    AuditLogId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'auditlog',
        key: 'Id'
      }
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'enclosure'
  });
};
