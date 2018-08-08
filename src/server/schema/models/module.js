/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('module', {
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
    SortOrder: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: "1"
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
    tableName: 'module'
  });
};
