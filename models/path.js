const Sequelize = require('sequelize');
const sequelize = require('./sequelize');

const Path = sequelize.define('paths', {
    pathID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING(45),
        allowNull: false,
        unique: true,
    },
})

module.exports = Path;