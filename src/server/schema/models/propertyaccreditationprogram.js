/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('propertyaccreditationprogram', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    PropertyId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    AccreditationProgramId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'accreditationprogram',
        key: 'Id'
      }
    },
    IsActive: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: "1"
    },
    LicenseNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StateId: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Notes: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'propertyaccreditationprogram'
  });
};
