/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('subscriptionplan', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IsActive: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1"
    },
    IsAllowedForSignup: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1"
    },
    EffectiveFromDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ServiceTypes: {
      type: "BLOB",
      allowNull: true
    },
    IsTrial: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    TrialDays: {
      type: DataTypes.INTEGER(6),
      allowNull: false,
      defaultValue: "0"
    },
    IsPriceDecideOnApp: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    SortOrder: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    HasNvdOrProAccess: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1"
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
    SetupFee: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    AnnualFee: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    MonthlyFee: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    AccreditationFee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    CustomerFeePhone: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    CustomerFeeEmail: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    BasicUsersAllowed: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: "0"
    },
    BasicPropertiesAllowed: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: "0"
    },
    BasicNVDAllowed: {
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
    tableName: 'subscriptionplan'
  });
};
