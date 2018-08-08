/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nvdstatusdata', {
    NVDStatusId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'nvdstatus',
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
    tableName: 'nvdstatusdata'
  });
};
