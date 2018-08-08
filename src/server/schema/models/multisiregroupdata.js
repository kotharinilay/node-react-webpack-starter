/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('multisiregroupdata', {
    MultiSireGroupId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'multisiregroup',
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
    tableName: 'multisiregroupdata'
  });
};
