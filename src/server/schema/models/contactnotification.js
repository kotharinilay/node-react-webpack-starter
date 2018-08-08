/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contactnotification', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    Subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    TagLine: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Body: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Nature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AuditLogId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'auditlog',
        key: 'Id'
      }
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'contactnotification'
  });
};
