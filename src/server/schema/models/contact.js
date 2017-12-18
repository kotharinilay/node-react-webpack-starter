/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contact', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    FirstName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    LastName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    AvatarField: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Mobile: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    IsDeleted: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: '0'
    },
    PasswordSalt: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PasswordHash: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'contact'
  });
};
