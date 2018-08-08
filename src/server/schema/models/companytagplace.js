/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('companytagplace', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    TagPlaceId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'tagplace',
        key: 'Id'
      }
    },
    CompanyId: {
      type: "BINARY(16)",
      allowNull: true,
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
        model: 'property',
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
    tableName: 'companytagplace'
  });
};
