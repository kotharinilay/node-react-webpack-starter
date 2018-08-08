/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('companyinvoice', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    InvoiceNo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    InvoiceDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    SetupFeeAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    AnnualFeeAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    MonthlyFeeAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    GrossAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    DiscountAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    AccreditationFee: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    CustomerFeePhone: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    CustomerFeeEmail: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    NetAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    TaxAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    PayableAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    TaxPercentage: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    PromotionalCoupon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsTransactionSuccess: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    PaymentGatewayName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PaymentGatewayTransactionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PromoCouponId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'promotionalcoupon',
        key: 'Id'
      }
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
    tableName: 'companyinvoice'
  });
};
