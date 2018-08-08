/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tagstatus', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'tagstatus'
  });
};
