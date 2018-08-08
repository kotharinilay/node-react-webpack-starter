/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('modulescreen', {
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
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'modulescreen'
  });
};
