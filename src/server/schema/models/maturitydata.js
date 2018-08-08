/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('maturitydata', {
    MaturityId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'maturity',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    MaturityCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MaturityName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'maturitydata'
  });
};
