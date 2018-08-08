/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nvd_livestocksummary', {
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
    NumberOfHead: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0"
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Comment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BrandFileId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
        key: 'Id'
      }
    },
    BreedId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'breed',
        key: 'Id'
      }
    },
    MaturityId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'maturity',
        key: 'Id'
      }
    },
    GenderId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'gender',
        key: 'Id'
      }
    },
    NT_Chemical: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NT_TreatmentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NFAS_DentitionId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'dentition',
        key: 'Id'
      }
    },
    NFAS_DaysOnFeed: {
      type: DataTypes.INTEGER(6),
      allowNull: true
    },
    SA_PrefixTattooId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
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
    tableName: 'nvd_livestocksummary'
  });
};
