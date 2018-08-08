/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_menugroup', {
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Icon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    HoverIcon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SortOrder: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: "1"
    }
  }, {
    tableName: 'view_menugroup'
  });
};
