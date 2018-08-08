/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('modulescreenactivity', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ModuleId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'module',
        key: 'Id'
      }
    },
    ScreenId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'modulescreen',
        key: 'Id'
      }
    },
    GroupId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'screenactivitygroup',
        key: 'Id'
      }
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'modulescreenactivity'
  });
};
