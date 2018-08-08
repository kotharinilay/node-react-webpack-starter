/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chemicalproductwhp', {
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
    ActivityId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'chemicalproductactivity',
        key: 'Id'
      }
    },
    SpeciesId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'species',
        key: 'Id'
      }
    },
    NumberOfDays: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: "0"
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'chemicalproductwhp'
  });
};
