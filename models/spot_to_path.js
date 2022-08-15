const { Sequelize } = require('sequelize');
const sequelize = require('./sequelize');
const Spot = require('./spot');
const Path = require('./path');

const SpotToPath = sequelize.define('spotpath',{
        spotpathID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        timestamps: false 
});

Spot.belongsToMany(Path, { 
    through: SpotToPath,
    foreignKey: {
        name:'spotID',
        allowNull: false,
    }
});
Path.belongsToMany(Spot, { 
    through: SpotToPath,
    foreignKey: {
        name:'pathID',
        allowNull: false,
    }
});

// SpotToPath.sync({alter: true}).then(() => {
//     // working with table 

// }).catch((err) => {
//     console.log(err);
// })

module.exports = SpotToPath;