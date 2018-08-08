/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockstatushistory', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    LivestockId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestock',
        key: 'Id'
      }
    },
    PropertyId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    ActivityStatusId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestockactivitystatus',
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
    Comment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'livestockstatushistory'
  });
};
