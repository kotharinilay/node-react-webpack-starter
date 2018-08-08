/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('breedcomposition', {
    LivestockId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'livestock',
        key: 'Id'
      }
    },
    BreedId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'breed',
        key: 'Id'
      }
    },
    Percentage: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    tableName: 'breedcomposition'
  });
};
