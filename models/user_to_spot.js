const { Sequelize } = require('sequelize');
const sequelize = require('./sequelize');
const User = require('./user');
const Spot = require('./spot');

const UserToSpot = sequelize.define('userspot',{
        userspotID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        timestamps: false 
});

User.belongsToMany(Spot, { 
    through: UserToSpot,
    foreignKey: {
        name:'userID',
        allowNull: false,
    }
});
Spot.belongsToMany(User, { 
    through: UserToSpot,
    foreignKey: {
        name:'spotID', 
        allowNull: false,
    },
});

// UserToSpot.sync({alter: true}).then(() => {
//     // working with table 

// }).catch((err) => {
//     console.log(err);
// })

module.exports = UserToSpot;