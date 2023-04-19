const mongoose = require("mongoose");

const ConfigSchema = new mongoose.Schema({
    uploaded_by: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    data: {
        type: String,
        required: true,
    },
    star: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model("Config", ConfigSchema);
