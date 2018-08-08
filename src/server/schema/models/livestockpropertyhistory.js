/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockpropertyhistory', {
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
    EntryDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ExitDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    QtyOfFeed: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00"
    },
    CostOfFeed: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00"
    },
    CostOfScan: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00"
    },
    LivestockEntryEventId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestockevent',
        key: 'Id'
      }
    },
    LivestockExitEventId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'livestockevent',
        key: 'Id'
      }
    },
    EntryWeight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ExitWeight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'livestockpropertyhistory'
  });
};
