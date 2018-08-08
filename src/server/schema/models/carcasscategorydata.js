/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('carcasscategorydata', {
    CarcassCategoryId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'carcasscategory',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    CategoryCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CategoryName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'carcasscategorydata'
  });
};
