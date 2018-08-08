/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nvddocument', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    NVDId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'nvd',
        key: 'Id'
      }
    },
    DocumentType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DocumentNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OfficeOfIssue: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    FileId: {
      type: "BINARY(16)",
      allowNull: false
    },
    AuditLogId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'auditlog',
        key: 'Id'
      }
    },
    IsDeleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'nvddocument'
  });
};
