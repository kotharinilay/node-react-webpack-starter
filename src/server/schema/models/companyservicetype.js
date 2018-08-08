/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('companyservicetype', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    ServiceTypeId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'servicetype',
        key: 'Id'
      }
    },
    CompanyId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'company',
        key: 'Id'
      }
    },
    PropertyId: {
      type: "BINARY(16)",
      allowNull: true
    },
    IsExclude: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1"
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
    tableName: 'companyservicetype'
  });
};
