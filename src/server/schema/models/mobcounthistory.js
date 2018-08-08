/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mobcounthistory', {
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
    LivestockCount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0"
    },
    DisposalMethodId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'disposalmethod',
        key: 'Id'
      }
    },
    DeathReason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LivestockEventId: {
      type: "BINARY(16)",
      allowNull: true,
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
    tableName: 'mobcounthistory'
  });
};
