/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dosebymeasure', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    UoMId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'uom',
        key: 'Id'
      }
    },
    IsConfiguredByAdmin: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    CompanyId: {
      type: "BINARY(16)",
      allowNull: true
    },
    PropertyId: {
      type: "BINARY(16)",
      allowNull: true
    },
    AuditLogId: {
      type: "BINARY(16)",
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'dosebymeasure'
  });
};
