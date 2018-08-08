/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('propertytypedata', {
    PropertyTypeId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'propertytype',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    PropertyTypeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PropertyTypeName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'propertytypedata'
  });
};
