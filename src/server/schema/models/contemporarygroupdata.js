/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contemporarygroupdata', {
    ContemporaryGroupId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'contemporarygroup',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    GroupCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    GroupName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'contemporarygroupdata'
  });
};
