/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('conceptionmethodata', {
    ConceptionMethodId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'conceptionmethod',
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
    tableName: 'conceptionmethodata'
  });
};
