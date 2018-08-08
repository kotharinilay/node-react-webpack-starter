/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('countrydata', {
    CountryId: {
      type: "BINARY(16)",
      allowNull: false,
      references: {
        model: 'country',
        key: 'Id'
      }
    },
    Language: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    CountryCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CountryName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'countrydata'
  });
};
