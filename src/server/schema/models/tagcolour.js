/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tagcolour', {
    Id: {
      type: "BINARY(16)",
      allowNull: true
    },
    Colour: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Year: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tagcolour'
  });
};
