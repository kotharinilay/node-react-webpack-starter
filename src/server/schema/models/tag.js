/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tag', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    EID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    VisualTag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NLISID: {
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
      allowNull: false,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    CurrentLivestockId: {
      type: "BINARY(16)",
      allowNull: true
    },
    CurrentStatusId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'tagstatus',
        key: 'Id'
      }
    },
    TagColorId: {
      type: "BINARY(16)",
      allowNull: true
    },
    TagYear: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SpeciesId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'species',
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
    }
  }, {
    tableName: 'tag'
  });
};
