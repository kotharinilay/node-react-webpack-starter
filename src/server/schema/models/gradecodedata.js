/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('gradecodedata', {
    GradeCodeId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'gradecode',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    GradeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    GradeName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'gradecodedata'
  });
};
