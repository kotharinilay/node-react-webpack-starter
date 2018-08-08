/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('breeddata', {
    BreedId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'breed',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    BreedCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BreedName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'breeddata'
  });
};
