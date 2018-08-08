/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('servicetypedata', {
    ServiceTypeId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'servicetype',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    ServiceTypeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ServiceTypeName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'servicetypedata'
  });
};
