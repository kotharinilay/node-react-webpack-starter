/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('enclosuretypedata', {
    EnclosureTypeId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'enclosuretype',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    EnclosureTypeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    EnclosureTypeName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'enclosuretypedata'
  });
};
