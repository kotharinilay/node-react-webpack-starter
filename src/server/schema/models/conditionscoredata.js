/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('conditionscoredata', {
    ConditionScoreId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'conditionscore',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    ScoreCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ScoreName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'conditionscoredata'
  });
};
