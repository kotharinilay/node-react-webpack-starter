/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('speciestypedata', {
    SpeciesTypeId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'speciestype',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    SpeciesTypeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SpeciesTypeName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'speciestypedata'
  });
};
