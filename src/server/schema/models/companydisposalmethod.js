/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('companydisposalmethod', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    DisposalMethodId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'disposalmethod',
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
    RegionId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'company',
        key: 'Id'
      }
    },
    BusinessId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'company',
        key: 'Id'
      }
    },
    PropertyId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'company',
        key: 'Id'
      }
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
    tableName: 'companydisposalmethod'
  });
};
