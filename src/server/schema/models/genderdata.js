/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('genderdata', {
    GenderId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'gender',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    GenderCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    GenderName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'genderdata'
  });
};
