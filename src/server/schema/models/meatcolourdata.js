/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('meatcolourdata', {
    MeatColourId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'meatcolour',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    ColourCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ColourName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'meatcolourdata'
  });
};
