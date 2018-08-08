/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('uomtypedata', {
    UoMTypeId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'uomtype',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    TypeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TypeName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'uomtypedata'
  });
};
