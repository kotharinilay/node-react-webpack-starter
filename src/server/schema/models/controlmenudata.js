/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('controlmenudata', {
    ControlMenuId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'controlmenu',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'controlmenudata'
  });
};
