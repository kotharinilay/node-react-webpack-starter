/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Livestock', {
    LivestockId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    EID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    VisualTag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    NLIS: {
      type: DataTypes.STRING,
      allowNull: true
    },
    SourcePIC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BirthDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Weight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    Sex: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Mob: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Enclosure: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Species: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Breed: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Maturity: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Livestock'
  });
};
