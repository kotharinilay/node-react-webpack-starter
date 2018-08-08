/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockfeed', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    FeedId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'feed',
        key: 'Id'
      }
    },
    DateOfFeed: {
      type: DataTypes.DATE,
      allowNull: false
    },
    PropertyId: {
      type: "BINARY(16)",
      allowNull: false
    },
    EnclosureId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'enclosure',
        key: 'Id'
      }
    },
    TotalLivestockCount: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    TotalFeedQty: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    CostPerTonne: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    TotalCost: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    IsContractorPerson: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    FeedByPersonId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    FeedPersonName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
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
    }
  }, {
    tableName: 'livestockfeed'
  });
};
