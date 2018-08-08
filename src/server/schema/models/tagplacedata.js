/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tagplacedata', {
    TagPlaceId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'tagplace',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    TagPlaceCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TagPlaceName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'tagplacedata'
  });
};
