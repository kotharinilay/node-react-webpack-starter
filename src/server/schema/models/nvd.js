/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nvd', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    ReferenceNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SerialNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsMobNVD: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    IsPaperNVD: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    PaperNVDNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SpeciesId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'species',
        key: 'Id'
      }
    },
    NVDType: {
      type: DataTypes.INTEGER(4),
      allowNull: false
    },
    SchemaVersion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TotalLivestockQty: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0"
    },
    NumberOfRumenDevices: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0"
    },
    NumberOfEarTags: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0"
    },
    NumberOfEID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0"
    },
    VehicleRego: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AdditionalVehicleRego: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MovementCommenceDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    SaleyardArrivalTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    SaleAgentCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SaleAgentVendorCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DateOfDelivery: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DeliveredLivestockQty: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    SuspectQty: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    CondemnedQty: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    WelfareActivityNote: {
      type: DataTypes.STRING,
      allowNull: true
    },
    WelfareActivityTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DeliveredEnclosureId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'enclosure',
        key: 'Id'
      }
    },
    DeliveredEnclosureName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeliveredAtGPS: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsPostedOnNLIS: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    NLISReferenceNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NLISSubmittedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    NLISSubmittedByContactId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    IsPostedOnMLA: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    MLAReferenceNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MLASubmittedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    MLASubmittedByContactId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    MLASchemaVersion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MLAApiVersion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LastNVDStatusId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'nvdstatus',
        key: 'Id'
      }
    },
    SupportedAccreditations: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsDeleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    DeleteComment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PrivateSaleId: {
      type: "BINARY(16)",
      allowNull: true
    },
    IsForeignNVD: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
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
    tableName: 'nvd'
  });
};
