/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pasturecomposition', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    EnclosureId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'enclosure',
        key: 'Id'
      }
    },
    PropertyId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'property',
        key: 'Id'
      }
    },
    EventDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Lucerne: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    Fescue: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    Ryegrass: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    Clover: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    Annuals: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    Weeds: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    IsTotalKnockDown: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    IsOverSow: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    IsReSow: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    CompositionType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Comment: {
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
      allowNull: true
    }
  }, {
    tableName: 'pasturecomposition'
  });
};
