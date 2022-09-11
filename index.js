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
const nodemailer = require('nodemailer')
const { google } = require('googleapis');

app.use(cors())
app.use(express.json())

// AUTH
const CLIENT_ID = '673142117765-s8rpp52r7etabta82nt4bvl3gi5g4r32.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04NCuIPQPXT_ECgYIARAAGAQSNwF-L9Ir5gajMnHmYqktuUe6Mhfs-voaPcIW5C9czY-BDl7zqwToMUamd0rqPTUB3VZbrmp3FyQ'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN})

async function sendVerificationMail(email, uniqueString) {
    try {
        const accessToken = await oAuth2Client.getAccessToken()
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAUTH2',
                user: 'nthutestsdgs@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })
        const token = jwt.sign(
            {
                email: email, 
                uniqueString: uniqueString,
                type: 0,
            },
            'secret123', 
        )
        const mailOptions = {
            from: 'NTHUSDGS <nthusdgs@gmail.com',
            to: email,
            subject: '[NTHU SDGS] Verify Your Email',
            text: 'Go to this link: https://sdgs11.herokuapp.com/verifymail/' + token + ' to verify your email. Thanks',
            html: '<p>Press <a href=https://sdgs11.herokuapp.com/verifymail/' + token + '>here</a> to verify your email. Thanks</p>'
        }
        const result = await transport.sendMail(mailOptions);
        console.log(result);
        return result;
    } catch (err) {
        console.log(err);
        return err;
    }
}

app.post('/api/register', async (req, res) => {
    try {
        const studentID = req.body.studentID === '' ? null : req.body.studentID;
        var randString = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 20; i++)
            randString += possible.charAt(Math.floor(Math.random() * possible.length));
        const hashString = await bcrypt.hash(randString, 10);
        const hashPassword = await bcrypt.hash(req.body.newPassword, 10);
        await User.create({
            email: req.body.newEmail,
            password: hashPassword,
            studentID: studentID,
            verified: false,
            uniqueString: hashString
        })
        if(req.body.studentID === '') res.json({status: 'ok2'});
        else res.json({status: "ok1"});
        await sendVerificationMail(req.body.newEmail, randString);
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail', error: 'Email Registered'});
    }
})

app.get('/api/verify/:token', async(req, res) => {
    try {
        const token = jwt.verify(req.params.token, 'secret123');
        const email = token.email;
        const uniqueString = token.uniqueString;
        const type = token.type;
        console.log(uniqueString);
        const user = await User.findOne({
            where: {
                email: email
            }
        })
        if (user) {
            const stringValid = await bcrypt.compare(uniqueString, user.uniqueString);
            if (stringValid) {
                if(type === 0) {
                    user.verified = true;
                    await user.save();
                    return res.json({status: 'ok'});
                }else if(type === 1) {
                    return res.json({status: 'ok'});
                }
            }
            return res.json({status: 'fail', error: "Verify Failed"});
        }else {
            return res.json({status: 'fail', error: "Invalid URL"});
        }
    } catch (err) {
        return res.json({status: 'fail', error: err});
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
            if(!user.verified) return res.json({status: 'fail', error: "Verify First"})
            else{
                const token = jwt.sign({
                    userID: user.userID,
                    name: user.name,
                    email: user.email,
                    studentID: user.studentID,
                }, 'secret123')
                return res.json({status: 'ok', user: token})
            }
        }else{
            return res.json({status: 'fail', error: "Password Incorrect"})
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

async function sendResetMail(email, uniqueString) {
    try {
        const accessToken = await oAuth2Client.getAccessToken()
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAUTH2',
                user: 'nthutestsdgs@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })
        const token = jwt.sign(
            {
                email: email, 
                uniqueString: uniqueString,
                type: 1,
            },
            'secret123', 
        )
        const mailOptions = {
            from: 'NTHUSDGS <nthusdgs@gmail.com',
            to: email,
            subject: '[NTHU SDGS] Reset Password',
            text: 'Go to this link: https://sdgs11.herokuapp.com/resetpassword/' + token + ' to reset your password. Thanks',
            html: '<p>Press <a href=https://sdgs11.herokuapp.com/resetpassword/' + token + '>here</a> to reset your password. Thanks</p>'
        }
        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (err) {
        return err;
    }
}

app.post('/api/resetMail', async (req, res) => {
    try {
        var randString = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 20; i++)
            randString += possible.charAt(Math.floor(Math.random() * possible.length));
        const hashString = await bcrypt.hash(randString, 10);
        const user = await User.findOne({
            where: {
                email: req.body.email,
            }
        })
        if (user) {
            if(user.verified === false) return res.json({status: "fail", error: "Please Verify Email First"});
            user.uniqueString = hashString;
            await user.save();
        } else {
            return res.json({status: "fail", error: "Email Not Registered"});
        }
        res.json({status: "ok"});
        await sendResetMail(req.body.email, randString);
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail', error: err});
    }
})

app.post('/api/resetPassword', async(req, res) => {
    try {
        const token= jwt.verify(req.body.token, 'secret123');
        console.log(token);
        const email = token.email;
        const user = await User.findOne({
            where: {
                email: email
            }
        })
        var randString = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 20; i++)
            randString += possible.charAt(Math.floor(Math.random() * possible.length));
        const hashString = await bcrypt.hash(randString, 10);
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashPassword;
        user.uniqueString = hashString;
        await user.save();
        // res.send("Verified Successfully");
        return res.json({status: "ok"});
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail', error: "Reset Failed"});
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


// PATH
app.post('/api/path', async (req, res) => {
    const pathID = req.body.pathID;
    // Get spotID from spotpath
    try {
        const spotPath = await SpotToPath.findAll({
            where: {pathID: pathID}
        });
        if(spotPath.length === 0) return res.json({status: "fail", error: "Invalid pathID"});
        const pathData = await Path.findOne({
            where: {pathID: pathID}
        })
        return res.json({status: "ok", pathData: pathData, spotPath: spotPath});
    } catch (err) {
        console.log(err);
        return res.json({status: "fail", error: "Fetch Error"});
    }
})

app.post('/api/spotAll', async (req, res) => {
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

// SPOT
app.post('/api/spot', async (req, res) => {
    const spotID = req.body.spotID;
    try {
        const spotData = await Spot.findOne({
            where: {
                spotID: spotID,
            }
        });
        return res.json({status: 'ok', spotData: spotData});
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail', error: "Cannot Get spotData"});
    }
})

app.post('/api/spotFinished', async (req, res) => {
    const token = req.headers["x-access-token"];
    try {
        const decoded = jwt.verify(token, 'secret123');
        const userID = decoded.userID;
        const spotID = req.body.spotID
        const finishedData = await UserToSpot.findOne({
            where: {
                userID: userID,
                spotID: spotID
            }
        })
        console.log("FINSIHED" + finishedData);
        return res.json({status: 'ok', finishedData: finishedData});
    } catch (err) {
        console.log(err);
        return res.json({status: 'fail', error: "Cannot Get finishedList"})
    }
})

const port = process.env.PORT || 3001

app.listen(port, () => {
    console.log("Server started on " + port)
})

