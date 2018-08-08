/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_tags', {
    TagId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    EID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NLISID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    VisualTag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IssueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ReceivedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    OriginPropertyId: {
      type: "BINARY(16)",
      allowNull: false
    },
    CurrentLivestockId: {
      type: "BINARY(16)",
      allowNull: true
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AuditLogId: {
      type: "BINARY(16)",
      allowNull: true
    },
    OriginPIC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TagStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TagStatusLanguage: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    Species: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SpeciesLanguage: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    SpeciesId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TagColour: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TagYear: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'view_tags'
  });
};
