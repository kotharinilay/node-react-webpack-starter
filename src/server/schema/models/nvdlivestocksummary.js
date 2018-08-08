/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nvdlivestocksummary', {
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
    NumberOfHead: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0"
    },
    Description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Comment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BrandFileId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'filestorage',
        key: 'Id'
      }
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'nvdlivestocksummary'
  });
};
