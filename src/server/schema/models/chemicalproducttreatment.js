/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chemicalproducttreatment', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    TreatmentSessionProductId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'treatmentsessionproduct',
        key: 'Id'
      }
    },
    TreatmentTypeId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'treatmenttype',
        key: 'Id'
      }
    },
    TreatmentMethodId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'treatmentmethod',
        key: 'Id'
      }
    },
    IsChemicalVaccine: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    ChemicalProductStockId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'chemicalproductstock',
        key: 'Id'
      }
    },
    Dosage: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    DosageUoMId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'uom',
        key: 'Id'
      }
    },
    DateOfTreatment: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ContractorCompanyId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'company',
        key: 'Id'
      }
    },
    UseContractorStock: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    AuthorizedPersonId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    AdminPerson: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TreatedPropertyId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    TotalConsumedQty: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ConsumedQtyUoMId: {
      type: "BINARY(16)",
      allowNull: true
    },
    LivestockCount: {
      type: DataTypes.INTEGER(11),
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
    tableName: 'chemicalproducttreatment'
  });
};
