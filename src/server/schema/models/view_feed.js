/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_feed', {
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    CompanyId: {
      type: "BINARY(16)",
      allowNull: true
    },
    PropertyId: {
      type: "BINARY(16)",
      allowNull: true
    },
    AuditLogId: {
      type: "BINARY(16)",
      allowNull: true
    },
    CreatedStamp: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'view_feed'
  });
};
