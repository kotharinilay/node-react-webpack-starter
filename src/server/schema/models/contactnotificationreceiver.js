/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('contactnotificationreceiver', {
    Id: {
      type: "BINARY(16)",
      allowNull: false,
      primaryKey: true
    },
    ReceiverId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contact',
        key: 'Id'
      }
    },
    NotificationId: {
      type: "BINARY(16)",
      allowNull: true,
      references: {
        model: 'contactnotification',
        key: 'Id'
      }
    },
    MarkAsRead: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: "0"
    },
    IsDeleted: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: "0"
    },
    UUID: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'contactnotificationreceiver'
  });
};
