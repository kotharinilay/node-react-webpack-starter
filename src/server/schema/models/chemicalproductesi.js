/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chemicalproductesi', {
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
    CountryId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'country',
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
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'chemicalproductesi'
  });
};
