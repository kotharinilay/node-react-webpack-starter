/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockcarcass', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    LivestockId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestock',
        key: 'Id'
      }
    },
    LivestockCount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "1"
    },
    LivestockEventId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestockevent',
        key: 'Id'
      }
    },
    FromBodyNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ToBodyNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ProcessedDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ProcessedTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    LotNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ChainNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OperatorNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ProcessedPropertyId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    ProcessedPIC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CarcassWeight: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    FatThickness: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    RibFatness: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    RumpFatThickness: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    DentitionId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'dentition',
        key: 'Id'
      }
    },
    LiveCarcassWeight: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    HotStandardCarcassWeight: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    BruiseScore: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0"
    },
    CarcassCategoryId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'carcasscategory',
        key: 'Id'
      }
    },
    ButtShapeId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'buttshape',
        key: 'Id'
      }
    },
    EQSReference: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0"
    },
    ProducerLicenseNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MSAStartCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BoningGroupId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'boninggroup',
        key: 'Id'
      }
    },
    MSAGraderId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'msagrader',
        key: 'Id'
      }
    },
    GradeDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    LeftSideScanTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    RightSideScanTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    HangMethodId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'hangmethod',
        key: 'Id'
      }
    },
    HGP: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LeftSideHSCW: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    RightSideHSCW: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    Brand: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PriceKG: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    Dest: {
      type: DataTypes.STRING,
      allowNull: true
    },
    VersionOfMSAModel: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TropicalBreedContent: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    HumpCold: {
      type: DataTypes.STRING,
      allowNull: true
    },
    EyeMuscleArea: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Ossification: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AUSMarbling: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MSAMarbling: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MeatColourId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'meatcolour',
        key: 'Id'
      }
    },
    FatMuscle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    FatColourId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'fatcolour',
        key: 'Id'
      }
    },
    FatDepth: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    pH: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    LoinTemperature: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    Cost: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    IsMilkFedVealer: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    IsRinse: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    HumpHeight: {
      type: DataTypes.INTEGER(6),
      allowNull: false,
      defaultValue: "0"
    },
    IsMSASaleyard: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    IsRIB: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    FeedType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DressingPercentage: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    RetailProductYield: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: "0.00"
    },
    Disease: {
      type: DataTypes.STRING,
      allowNull: true
    },
    GradeCodeId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'gradecode',
        key: 'Id'
      }
    },
    IsGrassSeed: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    IsArthritis: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
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
    tableName: 'livestockcarcass'
  });
};
