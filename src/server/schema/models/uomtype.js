/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('uomtype', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    TypeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TypeName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'uomtype'
  });
};
