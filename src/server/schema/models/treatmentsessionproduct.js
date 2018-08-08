/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('treatmentsessionproduct', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    TreatmentSessionId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'treatmentsession',
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
    ChemicalProductStockId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'chemicalproductstock',
        key: 'Id'
      }
    },
    TreatName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IsVaccineChemical: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1"
    },
    Dosage: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00"
    },
    DosageUoMId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'uom',
        key: 'Id'
      }
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    },
    IsDeleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    }
  }, {
    tableName: 'treatmentsessionproduct'
  });
};
