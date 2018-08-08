/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_gender', {
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    SystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    GenderCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    GenderName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NameCode: {
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
    tableName: 'view_gender'
  });
};
