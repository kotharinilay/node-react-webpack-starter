/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('breedtypedata', {
    BreedTypeId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'breedtype',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    BreedTypeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BreedTypeName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'breedtypedata'
  });
};
