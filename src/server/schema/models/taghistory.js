/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('taghistory', {
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    DeviceTagId: {
      type: "BINARY(16)",
      allowNull: false
    },
    LivestockId: {
      type: "BINARY(16)",
      allowNull: false
    },
    AssignDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AuditLogId: {
      type: "BINARY(16)",
      allowNull: true
    }
  }, {
    tableName: 'taghistory'
  });
};
