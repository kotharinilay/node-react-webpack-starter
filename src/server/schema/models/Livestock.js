/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestock', {
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
    SocietyId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Mob: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NumberOfHead: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "1"
    },
    IsMob: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    BirthDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    BirthWeight: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00"
    },
    BirthPIC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BreedTypeId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'breedtype',
        key: 'Id'
      }
    },
    CurrentPropertyId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    CurrentEnclosureId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'enclosure',
        key: 'Id'
      }
    },
    CurrentTagId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'tag',
        key: 'Id'
      }
    },
    InductionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DefaultGPS: {
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
    SpeciesTypeId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'speciestype',
        key: 'Id'
      }
    },
    MaturityStatusId: {
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
    ActivityStatusId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'livestockactivitystatus',
        key: 'Id'
      }
    },
    CurrentWeight: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00"
    },
    DSE: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ColorId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'livestockcolour',
        key: 'Id'
      }
    },
    LivestockCategoryId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'livestockcategory',
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
    HasLT: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    HasEU: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    IsFinancierOwned: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    LivestockOriginId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'livestockorigin',
        key: 'Id'
      }
    },
    Identifier: {
      type: DataTypes.STRING,
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
    tableName: 'livestock'
  });
};
