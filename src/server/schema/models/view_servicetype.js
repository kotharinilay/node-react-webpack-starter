/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_servicetype', {
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ColorCode: {
      type: DataTypes.STRING,
      allowNull: true
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
    },
    AuditLogId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedStamp: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'view_servicetype'
  });
};
