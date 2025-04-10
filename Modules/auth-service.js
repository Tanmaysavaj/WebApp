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

let dbConnection = null;

module.exports.initialize = async () => {
    if (dbConnection) return;

    try {
        dbConnection = await mongoose.connect(process.env.MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        User = mongoose.model("users", userSchema);
    } catch (err) {
        throw new Error("Failed to connect to MongoDB: " + err.message);
    }
};

module.exports.registerUser = async (userData) => {
    if (userData.password !== userData.password2) {
        throw "Passwords do not match";
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = new User({
        userName: userData.userName,
        password: hashedPassword,
        email: userData.email,
        loginHistory: []
    });

    try {
        await newUser.save();
    } catch (err) {
        if (err.code === 11000) throw "User Name already taken";
        throw "There was an error creating the user: " + err;
    }
};

module.exports.checkUser = async (userData) => {
    const user = await User.findOne({ userName: userData.userName });
    if (!user) throw `Unable to find user: ${userData.userName}`;

    const match = await bcrypt.compare(userData.password, user.password);
    if (!match) throw `Incorrect Password for user: ${userData.userName}`;

    // Maintain max 8 login history entries
    if (user.loginHistory.length >= 8) user.loginHistory.pop();

    user.loginHistory.unshift({
        dateTime: new Date(),
        userAgent: userData.userAgent
    });

    await User.updateOne(
        { userName: user.userName },
        { $set: { loginHistory: user.loginHistory } }
    );

    return user;
};
