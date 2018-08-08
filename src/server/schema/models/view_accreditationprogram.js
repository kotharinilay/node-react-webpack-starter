/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_accreditationprogram', {
    ProgramId: {
      type: "BINARY(16)",
      allowNull: false
    },
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    AccreditationProgramCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AccreditationProgramName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AuditLogId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedStamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    IsActive: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1"
    },
    IsDeleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    }
  }, {
    tableName: 'view_accreditationprogram'
  });
};
