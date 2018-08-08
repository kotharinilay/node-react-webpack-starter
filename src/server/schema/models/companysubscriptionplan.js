/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('companysubscriptionplan', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    CompanyId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'company',
        key: 'Id'
      }
    },
    SubscriptionPlanId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'subscriptionplan',
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
    RequestDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ValidFromDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ValidToDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    IsTrial: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    IsActive: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    HasNvdOrProAppAccess: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    HasMobAccess: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    HasEIDAccess: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    NoOfAllowedUsers: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: "0"
    },
    NoOfAllowedProperties: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: "0"
    },
    NoOfAllowedNVD: {
      type: DataTypes.INTEGER(6),
      allowNull: false,
      defaultValue: "0"
    },
    AdditionalUsersPurchased: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: "0"
    },
    AdditionalPropertyPurchased: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: "0"
    },
    AdditionalNVDPurchased: {
      type: DataTypes.INTEGER(6),
      allowNull: false,
      defaultValue: "0"
    },
    IsAdditionalUserAllowed: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    IsAdditionalPropertyAllowed: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    IsAdditionalNVDAllowed: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    MaxAdditionalUsersAllowed: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    MaxAdditionalPropertiesAllowed: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    MaxAdditionalNVDAllowed: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    AdditionalUserFeePerMonth: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    AdditionalPropertyFeePerMonth: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    AdditionalNVDFeePerMonth: {
      type: DataTypes.DECIMAL,
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
    }
  }, {
    tableName: 'companysubscriptionplan'
  });
};
