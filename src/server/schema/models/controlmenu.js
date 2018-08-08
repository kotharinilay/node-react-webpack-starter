/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('controlmenu', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
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
    RedirectURL: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModuleId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'module',
        key: 'Id'
      }
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
    ParentId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'controlmenu',
        key: 'Id'
      }
    },
    GroupId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'menugroup',
        key: 'Id'
      }
    },
    IsSetupMenu: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: "0"
    },
    IsActive: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1"
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'controlmenu'
  });
};
