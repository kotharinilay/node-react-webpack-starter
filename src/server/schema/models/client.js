/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('client', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ClientId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ClientSecret: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    IsDeleted: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    }
  }, {
    tableName: 'client'
  });
};
