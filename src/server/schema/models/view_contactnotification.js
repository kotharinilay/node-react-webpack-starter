/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_contactnotification', {
    Id: {
      type: "BINARY(16)",
      allowNull: false
    },
    ReceiverId: {
      type: "BINARY(16)",
      allowNull: true
    },
    MarkAsRead: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: "0"
    },
    NotificationReceiverId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    TagLine: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Body: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Sender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ReceivedDateTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ReceivedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'view_contactnotification'
  });
};
