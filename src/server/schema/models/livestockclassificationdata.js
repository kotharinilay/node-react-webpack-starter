/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockclassificationdata', {
    LivestockClassificationId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestockclassification',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    ClassificationCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ClassificationName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'livestockclassificationdata'
  });
};
