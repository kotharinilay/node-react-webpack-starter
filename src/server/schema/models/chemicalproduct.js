/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chemicalproduct', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    Code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsActive: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1"
    },
    DisposalNotes: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ProductCategoryId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'chemicalcategory',
        key: 'Id'
      }
    },
    Species: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IsConfiguredByAdmin: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    CompanyId: {
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
    tableName: 'chemicalproduct'
  });
};
