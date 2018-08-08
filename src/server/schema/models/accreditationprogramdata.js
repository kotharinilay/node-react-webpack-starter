/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('accreditationprogramdata', {
    ProgramId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'accreditationprogram',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    ProgramCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ProgramName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'accreditationprogramdata'
  });
};
