const Config = require("../models/Config");

async function getConfigBy(field, value) {
    const config = await Config.findOne({ [field]: value });
    if (!user) {
        return null;
    }
    return config;
}

async function getAllConfig() {
    const config = await Config.find()
    if (!user) {
        return null;
    }
    return config;
}

async function updateConfig(filter, update) {   
    const config = await Config.findOneAndUpdate(
        filter,
        update
    );
    if (!user) {
        return null;
    }
    return config;
}

async function createConfig(
    uploaded_by,
    data,
) {
    const config = new Config({
        uploaded_by: uploaded_by,
        data: data,
    });

    await config.save();
    console.log("Created Config " + config._id);
    return config;
}

module.exports = {createConfig, getConfigBy, updateConfig, getAllConfig};