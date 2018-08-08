/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('msagraderdata', {
    MSAGraderId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'msagrader',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    GraderCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    GraderName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'msagraderdata'
  });
};
