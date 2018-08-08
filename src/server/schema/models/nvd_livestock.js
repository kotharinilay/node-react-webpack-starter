/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nvd_livestock', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    NVDId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'nvd',
        key: 'Id'
      }
    },
    NVDLivestockSummaryId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'nvd_livestocksummary',
        key: 'Id'
      }
    },
    LivestockId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestock',
        key: 'Id'
      }
    },
    NumberOfHead: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    EarmarkText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BrandText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PICEarTag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    HasLT: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    HasEU: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    HasERP: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    IsDelivered: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: "0"
    },
    DeliveredCount: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'nvd_livestock'
  });
};
