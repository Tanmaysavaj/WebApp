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

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
            return;
        }

        bcrypt.hash(userData.password, 10).then(hash => {
            let newUser = new User({
                userName: userData.userName,
                password: hash,
                email: userData.email,
                loginHistory: []
            });

            newUser.save().then(() => resolve()).catch(err => {
                if (err.code === 11000) {
                    reject("User Name already taken");
                } else {
                    reject("There was an error creating the user: " + err);
                }
            });
        }).catch(() => {
            reject("There was an error encrypting the password");
        });
    });
};

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName }).then(users => {
            if (users.length === 0) {
                reject(`Unable to find user: ${userData.userName}`);
                return;
            }

            bcrypt.compare(userData.password, users[0].password).then(match => {
                if (!match) {
                    reject(`Incorrect Password for user: ${userData.userName}`);
                    return;
                }

                if (users[0].loginHistory.length === 8) {
                    users[0].loginHistory.pop();
                }

                users[0].loginHistory.unshift({
                    dateTime: new Date(),
                    userAgent: userData.userAgent
                });

                User.updateOne(
                    { userName: users[0].userName },
                    { $set: { loginHistory: users[0].loginHistory } }
                ).then(() => {
                    resolve(users[0]);
                }).catch(err => {
                    reject("There was an error verifying the user: " + err);
                });

            }).catch(() => {
                reject("Error comparing passwords");
            });
        }).catch(() => {
            reject(`Unable to find user: ${userData.userName}`);
        });
    });
};
