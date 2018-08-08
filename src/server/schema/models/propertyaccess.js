/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('propertyaccess', {
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
    ContactId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    IsExternal: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    ValidFromDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ValidToDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CreatedBy: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'propertyaccess'
  });
};
