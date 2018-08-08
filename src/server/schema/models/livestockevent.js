/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockevent', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    PropertyId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    LivestockId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestock',
        key: 'Id'
      }
    },
    EnclosureId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'enclosure',
        key: 'Id'
      }
    },
    EventType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    EventDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    EventGPS: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NumberOfHead: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "1"
    },
    Reference: {
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
      allowNull: false
    }
  }, {
    tableName: 'livestockevent'
  });
};
