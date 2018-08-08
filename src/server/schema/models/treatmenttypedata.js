/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('treatmenttypedata', {
    TreatmentTypeId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'treatmenttype',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    TypeCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TypeName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'treatmenttypedata'
  });
};
