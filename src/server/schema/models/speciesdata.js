/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('speciesdata', {
    SpeciesId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'species',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    SpeciesCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SpeciesName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'speciesdata'
  });
};
