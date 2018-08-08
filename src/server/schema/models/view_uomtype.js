/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_uomtype', {
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    UoMTypeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UoMTypeName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'view_uomtype'
  });
};
