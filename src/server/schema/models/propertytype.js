/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('propertytype', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ColorCode: {
      type: DataTypes.TEXT,
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
    tableName: 'propertytype'
  });
};
