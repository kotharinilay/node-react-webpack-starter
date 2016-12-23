/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Employees', {
    EmployeeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '0'
    },
    Mobile: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '0'
    },
    EmailId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 'Employees'
  });
};
