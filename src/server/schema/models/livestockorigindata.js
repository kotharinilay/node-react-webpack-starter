/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockorigindata', {
    LivestockOriginId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestockorigin',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    OriginCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    OriginName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'livestockorigindata'
  });
};
