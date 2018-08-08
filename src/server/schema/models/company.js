/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('company', {
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
    RegionId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'company',
        key: 'Id'
      }
    },
    CompanyType: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ShortCode: {
      type: DataTypes.STRING,
      allowNull: true
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
    Website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ABN: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ACN: {
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
    BusinessCountryId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'country',
        key: 'Id'
      }
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
    PostalCountryId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'country',
        key: 'Id'
      }
    },
    ManagerId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    AsstManagerId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    LogoFileId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
        key: 'Id'
      }
    },
    IsAgliveSupportAdmin: {
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
    tableName: 'company'
  });
};
