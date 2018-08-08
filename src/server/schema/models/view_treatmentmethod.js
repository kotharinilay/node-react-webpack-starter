/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_treatmentmethod', {
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
      allowNull: false
    },
    TreatmentMethodCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TreatmentMethodName: {
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
    tableName: 'view_treatmentmethod'
  });
};
