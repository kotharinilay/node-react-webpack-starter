/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('uomdata', {
    UoMId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'uom',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    UoMCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UoMName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'uomdata'
  });
};
