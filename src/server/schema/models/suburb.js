/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('suburb', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StateId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'state',
        key: 'Id'
      }
    },
    PostCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DefaultGPS: {
      type: DataTypes.STRING,
      allowNull: true
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
    },
    IsDeleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    }
  }, {
    tableName: 'suburb'
  });
};
