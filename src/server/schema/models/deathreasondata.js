/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('deathreasondata', {
    DeathReasonId: {
      type: "BINARY(16)",
      allowNull: false
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    DeathReasonCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeathReasonName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'deathreasondata'
  });
};
