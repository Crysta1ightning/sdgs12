const Sequelize = require('sequelize');
const sequelize = require('./sequelize');

const Spot = sequelize.define('spots', {
    spotID: {
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
    description: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
    },
    x: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },    
    y: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    }
})

module.exports = Spot;