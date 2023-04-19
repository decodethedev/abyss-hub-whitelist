const mongoose = require("mongoose");

const Counter = require("../models/Counter");
const User = require("../models/User");

const { getRandomString } = require("../security/random");

async function getNextSequence(name) {
    var ret = await Counter.findByIdAndUpdate(name, 
        { $inc: { seq: 1 } },
        {new: true, upsert: true, select: {seq: 1}}
    );

    await ret.save()

    return ret.seq;
}

async function validateCredentials(discordID) {
    const user = await User.findOne({ discordID: discordID });
    if (!user) {
        return false;
    }
    return true;
}

async function getUserBy(field, value) {
    const user = await User.findOne({ [field]: value });
    if (!user) {
        return null;
    }
    return user;
}

async function updateUser(filter, update) {   
    const user = await User.findOneAndUpdate(
        filter,
        update
    );
    if (!user) {
        return null;
    }
    return user;
}

async function getAllUsers() {
    const users = await User.find();
    if (!users) {
        return null;
    }
    return users;
}

async function createUser(
    discordID,
    discordUser,
    blacklisted = false,
    subscription = 0,
) {
    const user = new User({
        _id: await getNextSequence("uid"),
        discordID: discordID,
        discordUser: discordUser,
        blacklisted: blacklisted,
        subscription: subscription,
        key: getRandomString(30),
    });

    await user.save();
    console.log("Created user " + user._id);
    return user;
}

module.exports = {createUser, getNextSequence, validateCredentials, getUserBy, updateUser, getAllUsers};