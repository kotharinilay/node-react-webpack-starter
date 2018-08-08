/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('treatmentsession', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    SessionName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Disease: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CompanyId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'company',
        key: 'Id'
      }
    },
    LastUsedOn: {
      type: DataTypes.DATE,
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
    tableName: 'treatmentsession'
  });
};
