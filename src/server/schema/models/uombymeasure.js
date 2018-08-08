/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('uombymeasure', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    UoMId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'uom',
        key: 'Id'
      }
    },
    UoMTypeId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'uomtype',
        key: 'Id'
      }
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'uombymeasure'
  });
};
