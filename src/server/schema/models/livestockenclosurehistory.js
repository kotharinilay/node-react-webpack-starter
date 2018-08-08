/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockenclosurehistory', {
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
    EnclosureId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'enclosure',
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
    EntryWeight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ExitWeight: {
      type: DataTypes.DECIMAL,
      allowNull: true
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
    tableName: 'livestockenclosurehistory'
  });
};
