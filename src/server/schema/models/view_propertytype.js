/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_propertytype', {
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ColorCode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    PropertyTypeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PropertyTypeName: {
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
    tableName: 'view_propertytype'
  });
};
