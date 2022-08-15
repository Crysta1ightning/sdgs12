const { Sequelize } = require('sequelize');
const sequelize = require('./sequelize');
const User = require('./user');
const Path = require('./path');

const UserToPath = sequelize.define('userpath',{
        userpathID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        timestamps: false 
});

User.belongsToMany(Path, { 
    through: UserToPath,
    foreignKey: {
        name:'userID',
        allowNull: false,
    }
});
Path.belongsToMany(User, { 
    through: UserToPath,
    foreignKey: {
        name:'pathID', 
        allowNull: false,
    },
});

// UserToPath.sync({alter: true}).then(() => {
//     // working with table 

// }).catch((err) => {
//     console.log(err);
// })

module.exports = UserToPath;