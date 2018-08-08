/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nvddetail', {
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
    ConsignerPropertyId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    ConsignerPIC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ConsignerPropertyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ConsignerPropertyAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ConsignerPropertySuburbId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'suburb',
        key: 'Id'
      }
    },
    ConsigneePropertyId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    ConsigneePIC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ConsigneePropertyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ConsigneePropertyAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ConsigneePropertySuburbId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    DestinationPropertyId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    DestinationPIC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DestinationPropertyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DestinationPropertyAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DestinationPropertySuburbId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    DeclarerContactId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    DeclarerFirstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeclarerLastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeclarerCompanyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeclarerAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeclarerSuburbId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'suburb',
        key: 'Id'
      }
    },
    DeclarerMobile: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeclarerTelephone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeclarerFax: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeclarerEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeclarerSignatureId: {
      type: "BINARY(16)",
      allowNull: true
    },
    HasDeclarerAcknowledged: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    DeclarerAcknowledgedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    TransporterContactId: {
      type: "BINARY(16)",
      allowNull: true
    },
    TransporterFirstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TransporterLastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TransporterCompanyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TransporterDriverFirstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TransporterDriverLastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TransporterAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TransporterSuburbId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'suburb',
        key: 'Id'
      }
    },
    TransporterMobile: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TransporterTelephone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TransporterFax: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TransporterEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TransporterSignatureId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
        key: 'Id'
      }
    },
    HasTransporterAcknowledged: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    TransporterAcknowledgedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    SaleAgentContactId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    SaleAgentFirstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SaleAgentLastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SaleAgentCompanyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SaleAgentAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SaleAgentSuburbId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'suburb',
        key: 'Id'
      }
    },
    SaleAgentMobile: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SaleAgentTelephone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SaleAgentFax: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SaleAgentEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SaleAgentSignatureId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
        key: 'Id'
      }
    },
    HasSaleAgentAcknowledged: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    SaleAgentAcknowledgedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'nvddetail'
  });
};
