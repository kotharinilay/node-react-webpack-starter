/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chemicalcategorydata', {
    CategoryId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'chemicalcategory',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    ChemicalCategoryCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ChemicalCategoryName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'chemicalcategorydata'
  });
};
