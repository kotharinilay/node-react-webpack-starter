/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('promotionalcoupon', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    Code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ValidUptoDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    HasDiscount: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1"
    },
    DiscountPercentage: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    TrialDays: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    IsActive: {
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
    tableName: 'promotionalcoupon'
  });
};
