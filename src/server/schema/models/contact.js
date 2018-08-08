/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contact', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    FirstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    LastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    CompanyId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'company',
        key: 'Id'
      }
    },
    Mobile: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Telephone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Fax: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BusinessAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BusinessSuburbId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'suburb',
        key: 'Id'
      }
    },
    BusinessStateId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'state',
        key: 'Id'
      }
    },
    BusinessPostCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PostalAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PostalSuburbId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'suburb',
        key: 'Id'
      }
    },
    PostalStateId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'state',
        key: 'Id'
      }
    },
    PostalPostCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    VehicleRegNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SaleAgentCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BadgeNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ContactCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UserName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PasswordHash: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PasswordSalt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    IsPrivate: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    IsActive: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1"
    },
    IsSuperUser: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    IsSiteAdministrator: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    IsNvdSignatureAllowed: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1"
    },
    SignatureFileId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
        key: 'Id'
      }
    },
    AvatarFileId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
        key: 'Id'
      }
    },
    PreferredPropertyId: {
      type: "BINARY(16)",
      allowNull: true
    },
    PreferredLanguage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PreferredWidgets: {
      type: "BLOB",
      allowNull: true
    },
    PreferredLivestockConfiguration: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    LastLoginDate: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'contact'
  });
};
