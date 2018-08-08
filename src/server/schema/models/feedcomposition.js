/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('feedcomposition', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    FeedId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'feed',
        key: 'Id'
      }
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Value: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'feedcomposition'
  });
};
