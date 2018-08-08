/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('hangmethoddata', {
    HangMethodId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'hangmethod',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    MethodCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MethodName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'hangmethoddata'
  });
};
