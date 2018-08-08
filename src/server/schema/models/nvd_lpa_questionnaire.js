/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nvd_lpa_questionnaire', {
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
    QuestionNo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    DataId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Loop: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SortOrder: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: "1"
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
    MLAFileId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'nvd_lpa_questionnaire'
  });
};
