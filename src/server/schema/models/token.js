/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('token', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    ContactId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    Token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ClientId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'client',
        key: 'Id'
      }
    }
  }, {
    tableName: 'token'
  });
};
