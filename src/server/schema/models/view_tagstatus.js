/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_tagstatus', {
    Id: {
      type: "BINARY(16)",
      allowNull: false
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    StatusCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StatusName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'view_tagstatus'
  });
};
