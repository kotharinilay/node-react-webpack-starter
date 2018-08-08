/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockactivitystatus', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    SortOrder: {
      type: DataTypes.INTEGER(2),
      allowNull: true
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'livestockactivitystatus'
  });
};
