const Sequelize = require('sequelize');

const sequelize = new Sequelize('heroku_e10daa3e369a0d3', 'b3fa30cce1e139', '369c63d7', {
    host: 'us-cdbr-east-06.cleardb.net',
    dialect: 'mysql',
    define: {
      timestamps: false
    }
});

module.exports = sequelize;
