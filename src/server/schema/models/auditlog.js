/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('auditlog', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    CreatedBy: {
      type: "BINARY(16)",
      allowNull: true
    },
    CreatedStamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    CreatedFromSource: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedFromFeature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedFromDeviceIdentity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModifiedBy: {
      type: "BINARY(16)",
      allowNull: true
    },
    ModifiedStamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ModifiedFromSource: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModifiedFromFeature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ModifiedFromDeviceIdentity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeletedBy: {
      type: "BINARY(16)",
      allowNull: true
    },
    DeletedStamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    DeletedFromSource: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeletedFromFeature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DeletedFromDeviceIdentity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'auditlog'
  });
};
