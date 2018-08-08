/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nvd_accreditation_questionnaire', {
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
    AccreditationProgramId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'accreditationprogram',
        key: 'Id'
      }
    },
    DataId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Value: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AgliveFileId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
        key: 'Id'
      }
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'nvd_accreditation_questionnaire'
  });
};
