/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockweighthistory', {
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
    EventDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Weight: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    PIC: {
      type: DataTypes.STRING,
      allowNull: false
    },
    EnclosureId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'enclosure',
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
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'livestockweighthistory'
  });
};
