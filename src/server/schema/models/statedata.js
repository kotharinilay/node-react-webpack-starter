/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('statedata', {
    StateId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'state',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    StateCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StateName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'statedata'
  });
};
