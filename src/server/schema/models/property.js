/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('property', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    CompanyId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'company',
        key: 'Id'
      }
    },
    PIC: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PropertyTypeId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'propertytype',
        key: 'Id'
      }
    },
    Address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SuburbId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'suburb',
        key: 'Id'
      }
    },
    BrandText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    EarmarkText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DefaultGPS: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MapZoomLevel: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    Area: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    UoMId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'uom',
        key: 'Id'
      }
    },
    PropertyFence: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ExportEligibility: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    LogoFileId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
        key: 'Id'
      }
    },
    BrandFileId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
        key: 'Id'
      }
    },
    PropertyManagerId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    AsstPropertyManagerId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    NLISUsername: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NLISPassword: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LivestockIdentifier: {
      type: DataTypes.STRING,
      allowNull: false
    },
    IsDeleted: {
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
    tableName: 'property'
  });
};
