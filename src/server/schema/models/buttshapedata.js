/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('buttshapedata', {
    ButtShapeId: {
      type: "BINARY(16)",
      allowNull: false
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    ShapeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ShapeName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'buttshapedata'
  });
};
