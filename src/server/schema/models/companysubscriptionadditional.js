/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('companysubscriptionadditional', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    CompanySubscriptionPlanId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'companysubscriptionplan',
        key: 'Id'
      }
    },
    InvoiceId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'companyinvoice',
        key: 'Id'
      }
    },
    PurchaseDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    NoOfUnit: {
      type: DataTypes.INTEGER(6),
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
    tableName: 'companysubscriptionadditional'
  });
};
