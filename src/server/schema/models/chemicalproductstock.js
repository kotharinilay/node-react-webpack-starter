/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chemicalproductstock', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    ChemicalProductId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'chemicalproduct',
        key: 'Id'
      }
    },
    BatchNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    StockOnHand: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    StockDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('current_timestamp')
    },
    Cost: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    UoMId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'uom',
        key: 'Id'
      }
    },
    Supplier: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DateOfManufacturing: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    StoragePIC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StorageAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StorageSuburbId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'suburb',
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
    },
    IsDeleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    }
  }, {
    tableName: 'chemicalproductstock'
  });
};
