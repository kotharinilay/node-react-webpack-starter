/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('moduledata', {
    ModuleId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'module',
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
    tableName: 'moduledata'
  });
};
