/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('filestorage', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    FileName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    FilePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    MimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    FileTimestamp: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'filestorage'
  });
};
