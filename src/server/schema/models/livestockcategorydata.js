/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('livestockcategorydata', {
    LivestockCategoryId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'livestockcategory',
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
    tableName: 'livestockcategorydata'
  });
};
