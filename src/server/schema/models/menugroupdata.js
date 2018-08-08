/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('menugroupdata', {
    MenuGroupId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'menugroup',
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
    tableName: 'menugroupdata'
  });
};
