/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('view_suburb_detail', {
    Id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    SuburbName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PostCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StateId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    StateSystemCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    StateName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StateCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StateLanguage: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    CountryLanguage: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    Country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    DefaultGPS: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CountryId: {
      type: "BINARY(16)",
      allowNull: true
    }
  }, {
    tableName: 'view_suburb_detail'
  });
};
