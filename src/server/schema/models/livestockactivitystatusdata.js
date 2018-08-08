/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockactivitystatusdata', {
    ActivityStatusId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestockactivitystatus',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    StatusCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StatusName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'livestockactivitystatusdata'
  });
};
