/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockattribute', {
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
    ManagementNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ManagementGroup: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NumberInBirth: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    NumberInReared: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    GeneticSireLivestockId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'livestock',
        key: 'Id'
      }
    },
    GeneticSireText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    FosterDamLivestockId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'livestock',
        key: 'Id'
      }
    },
    FosterDamText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    GeneticDamLivestockId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'livestock',
        key: 'Id'
      }
    },
    GeneticDamText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    RecipientDamLivestockId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'livestock',
        key: 'Id'
      }
    },
    RecipientDamText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MultiSireGroup: {
      type: "BINARY(36)",
      allowNull: true,
      references: {
        model: 'multisiregroup',
        key: 'Id'
      }
    },
    LastPropertyId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    LastPIC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    EarmarkText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PICEarTag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BrandText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BirthProductivity: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    Progeny: {
      type: DataTypes.INTEGER(6),
      allowNull: true
    },
    IsHGP: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    HGPText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    HasERP: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    LTLossReason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    EULossReason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LastMonthOfShearing: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    LastComment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsCastrated: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    CastratedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CastrationMethodId: {
      type: "BINARY(16)",
      allowNull: true
    },
    LastSeenDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    LastScanResult: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AdditionalTag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    FeedlotTag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BreederTag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StudName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    RegistrationDetail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    WeighBridgeTicket: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ReferenceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Appraisal: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DisposalMethodId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'disposalmethod',
        key: 'Id'
      }
    },
    DeceasedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DeathReason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DNACaseNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TSUBarcodeNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ReminderNote: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ReminderDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    BreederPIC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BreederContact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BreederContactMobile: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BreederContactEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsFreeMartin: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    DraftGroup: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsPPSR: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    FinancierName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    EIDBatchNo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SupplyChain: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ClassificationId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'livestockclassification',
        key: 'Id'
      }
    },
    ConceptionMethodId: {
      type: "BINARY(16)",
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
    ContemporaryId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contemporarygroup',
        key: 'Id'
      }
    },
    TagPlaceId: {
      type: "BINARY(16)",
      allowNull: true
    },
    GeneticStatusId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'geneticstatus',
        key: 'Id'
      }
    },
    LivestockGroupId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'livestockgroup',
        key: 'Id'
      }
    },
    HornStatusId: {
      type: "BINARY(16)",
      allowNull: true
    },
    JoinTypeId: {
      type: "BINARY(16)",
      allowNull: true
    },
    Lactation: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    Drop: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ScanDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    LivestockOriginReference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LivestockOriginPIC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DentitionId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'dentition',
        key: 'Id'
      }
    },
    Disease: {
      type: DataTypes.STRING,
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
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'livestockattribute'
  });
};
