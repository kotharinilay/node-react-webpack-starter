/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_species', {
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    SpeciesCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SpeciesName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AuditLogId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedStamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    MobPicturePath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MobPictureName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    MobPictureType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IndPicturePath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IndPictureName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IndPictureType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IndFileIconId: {
      type: "BINARY(16)",
      allowNull: true
    },
    MobIconFileId: {
      type: "BINARY(16)",
      allowNull: true
    },
    IsDeleted: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    }
  }, {
    tableName: 'view_species'
  });
};
