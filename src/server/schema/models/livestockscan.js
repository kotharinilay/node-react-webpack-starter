/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockscan', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    ScanPurposeId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'scanpurpose',
        key: 'Id'
      }
    },
    ScanDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Lactation: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    PregnancyResult: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ExpPregnancyDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    PregnancyDue: {
      type: DataTypes.INTEGER(6),
      allowNull: true
    },
    ConceptionMethodId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'conceptionmethod',
        key: 'Id'
      }
    },
    Decision: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ProcessingSession: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Disease: {
      type: DataTypes.STRING,
      allowNull: true
    },
    WeighingCategory: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Weight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    Appraisal: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ScanCompanyId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'company',
        key: 'Id'
      }
    },
    ScanPersonId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    AdministerByPerson: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ScanOnPropertyId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    ScanOnPIC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ScanCost: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    StomuchContent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ConditionScoreId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'conditionscore',
        key: 'Id'
      }
    },
    DentitionId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'dentition',
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
    tableName: 'livestockscan'
  });
};
