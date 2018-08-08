/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_controlmenu', {
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    SystemCode: {
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
    Icon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    HoverIcon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    RedirectURL: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModuleId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModuleSystemCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SortOrder: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: "1"
    },
    IsLast: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    IsSetupMenu: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: "0"
    }
  }, {
    tableName: 'view_controlmenu'
  });
};
