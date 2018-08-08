/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('scanpurposedata', {
    ScanPurposeId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'scanpurpose',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    PurposeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PurposeName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'scanpurposedata'
  });
};
