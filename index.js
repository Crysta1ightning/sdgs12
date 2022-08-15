const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Spot = require('./models/spot');
const Path = require('./models/path');
const SpotToPath = require('./models/spot_to_path');
const UserToSpot = require('./models/user_to_spot');
const bcrypt = require('bcryptjs');
const { Op } = require("sequelize");

app.use(cors())
app.use(express.json())

// AUTH
app.post('/api/register', async (req, res) => {
    const studentID = req.body.studentID === '' ? null : req.body.studentID;
    try {
        const hashPassword = await bcrypt.hash(req.body.newPassword, 10);
        await User.create({
            email: req.body.newEmail,
            password: hashPassword,
            studentID: studentID
        })
        if(req.body.studentID === '') return res.json({status: 'ok2'});
        return res.json({status: "ok1"});
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail', error: 'Email Registered'});
    }
})

app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                email: req.body.email,
            }
        })
        if(!user) return res.json({status: 'error', error: 'Invalid User'})
        const passwordValid = await bcrypt.compare(req.body.password, user.password);
        if(passwordValid){
            const token = jwt.sign({
                userID: user.userID,
                name: user.name,
                email: user.email,
                studentID: user.studentID,
            }, 'secret123')
            return res.json({status: 'ok', user: token})
        }else{
            return res.json({status: 'fail', error: "Password Invalid"})
        }
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail', error: "Error in Login"})
    }
})

app.get('/api/user', async (req, res) => {
    const token = req.headers["x-access-token"];
    try {
        const decoded = jwt.verify(token, 'secret123');
        const userID = decoded.userID;
        const user = await User.findOne({
            where: {userID: userID}
        });
        console.log(user);
        return res.json({status: "ok", user: user});
    } catch (err) {
        console.log(err);
        return res.json({status: "fail", error: "Invalid token"});
    }
})


// ALL
app.get('/api/all', async (req, res) => {
    try {
        const spotData = await Spot.findAll();
        return res.json({status: 'ok', spotData: spotData});
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail', error: "SpotData Error"});
    }
})


// PATHMAIN
app.get('/api/pathList', async (req, res) => {
    try {
        const pathListData = await Path.findAll();
        return res.json({status: 'ok', pathListData: pathListData});
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail', error: "Cannot Get pathList"});
    }
})

app.get('/api/pathFinish', async (req, res) => {
    const token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, 'secret123');
    const userID = decoded.userID;
    try {
        const spotPath = await SpotToPath.findAll({});
        try {
            const userSpot = await UserToSpot.findAll({
                where: {userID: userID}
            });
            // console.log(pathData);
            return res.json({status: "ok", spotPath: spotPath, userSpot: userSpot});
        } catch (err) {
            console.log(err);
            return res.json({status: "fail", error: "Invalid userID"});
        }
    } catch (err) {
        console.log(err);
        return res.json({status: "fail", error: "Failed to get SpotToPath"});
    }
})


// PATHPAGE
app.post('/api/path', async (req, res) => {
    const pathID = req.body.pathID;
    // Get spotID from spotpath
    try {
        const spotPath = await SpotToPath.findAll({
            where: {pathID: pathID}
        });
        console.log(spotPath);
        try {
            const pathData = await Path.findOne({
                where: {pathID: pathID}
            });
            // console.log(pathData);
            return res.json({status: "ok", pathData: pathData, spotPath: spotPath});
        } catch (err) {
            console.log(err);
            return res.json({status: "fail", error: "Invalid pathID"});
        }
    } catch (err) {
        console.log(err);
        return res.json({status: "fail", error: "Invalid pathID"});
    }
})

app.post('/api/spot', async (req, res) => {
    const spotIDList = req.body.spotIDList;
    try {
        const spotData = await Spot.findAll({
            where: {
                spotID: { [Op.in]: spotIDList },
            }
        });
        return res.json({status: 'ok', spotData: spotData});
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail', error: "Cannot Get pathList"});
    }
})

app.get('/api/finished', async (req, res) => {
    const token = req.headers["x-access-token"];
    try {
        const decoded = jwt.verify(token, 'secret123');
        const userID = decoded.userID;
        const finishedData = await UserToSpot.findAll({
            where: {
                userID: userID
            }
        })
        return res.json({status: 'ok', finishedData: finishedData})
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail', error: "Cannot Get finishedList"})
    }
})

app.post('/api/claim', async (req, res) => {
    const token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, 'secret123');
    const userID = decoded.userID;
    const spotID = req.body.spotID;
    console.log(userID);
    console.log(spotID);
    try {
        await UserToSpot.create({
            userID: userID,
            spotID: spotID,
        })
        return res.json({status: 'ok'});
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail'});
    }
})

app.get('/', async function (req, res) {
    try {
        const spotData = await Spot.findAll();
        return res.json({status: 'ok', spotData: spotData});
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail', error: "SpotData Error"});
    }
})

const port = process.env.PORT || 3001

app.listen(port, () => {
    console.log("Server started on " + port)
})

