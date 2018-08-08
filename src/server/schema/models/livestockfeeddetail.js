/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockfeeddetail', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    LivestockFeedId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestockfeed',
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
    LivestockEventId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestockevent',
        key: 'Id'
      }
    },
    FeedQty: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    FeedCost: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    LivestockCount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "1"
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'livestockfeeddetail'
  });
};
