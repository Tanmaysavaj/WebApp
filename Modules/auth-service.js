const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

let User;

const userSchema = new mongoose.Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGODB);
        db.on('error', err => reject(err));
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = async (userData) => {
    if (userData.password !== userData.password2) {
        throw "Passwords do not match";
    }

    try {
        const hash = await bcrypt.hash(userData.password, 10);

        const newUser = new User({
            userName: userData.userName,
            password: hash,
            email: userData.email,
            loginHistory: []
        });

        await newUser.save();
    } catch (err) {
        console.error("Error during registration:", err);
        if (err.code === 11000) {
            throw "User Name already taken";
        } else if (err.message && err.message.includes("hash")) {
            throw "There was an error encrypting the password";
        } else {
            throw "There was an error creating the user: " + err;
        }
    }
};

module.exports.checkUser = async (userData) => {
    try {
        const users = await User.find({ userName: userData.userName });

        if (users.length === 0) {
            throw `Unable to find user: ${userData.userName}`;
        }

        const match = await bcrypt.compare(userData.password, users[0].password);

        if (!match) {
            throw `Incorrect Password for user: ${userData.userName}`;
        }

        if (users[0].loginHistory.length === 8) {
            users[0].loginHistory.pop();
        }

        users[0].loginHistory.unshift({
            dateTime: new Date(),
            userAgent: userData.userAgent
        });

        await User.updateOne(
            { userName: users[0].userName },
            { $set: { loginHistory: users[0].loginHistory } }
        );

        return users[0];

    } catch (err) {
        console.error("Login error:", err);
        if (typeof err === "string") {
            throw err;
        } else {
            throw "There was an error verifying the user: " + err;
        }
    }
};
