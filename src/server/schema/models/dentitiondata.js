/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dentitiondata', {
    DentitionId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'dentition',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    DentitionCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DentitionName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'dentitiondata'
  });
};
