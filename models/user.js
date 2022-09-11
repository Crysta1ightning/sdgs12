const Sequelize = require('sequelize');
const sequelize = require('./sequelize');

const User = sequelize.define('users', {
    userID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true,
    },
    email: {
        type: Sequelize.STRING(45),
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    studentID: {
        type: Sequelize.INTEGER,
        unique: true,
    },
    username: {
        type: Sequelize.STRING(45),
    },
    verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    uniqueString: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = User;