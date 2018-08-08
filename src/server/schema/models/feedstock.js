/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('feedstock', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    FeedId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'feed',
        key: 'Id'
      }
    },
    StockOnHand: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    StockOnDate: {
      type: DataTypes.DATE,
      allowNull: true
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
    StockCost: {
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
    },
    IsDeleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    }
  }, {
    tableName: 'feedstock'
  });
};
