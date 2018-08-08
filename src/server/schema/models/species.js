/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('species', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    MobIconFileId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
        key: 'Id'
      }
    },
    IndFileIconId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
        key: 'Id'
      }
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
      allowNull: false
    },
    IsDeleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    }
  }, {
    tableName: 'species'
  });
};
