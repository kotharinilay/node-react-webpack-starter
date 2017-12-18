/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('token', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    ContactId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    Token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ClientId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'client',
        key: 'Id'
      }
    }
  }, {
    tableName: 'token'
  });
};
