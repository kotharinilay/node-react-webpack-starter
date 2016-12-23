/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Jobs', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0',
      primaryKey: true
    },
    mob: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Jobs'
  });
};
