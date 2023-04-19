const mongoose = require("mongoose");

const ScriptSchema = new mongoose.Schema({  
    primary_place_id: {
        type: Number,
        required: true,
        unique: true
    },

    secondary_place_ids: {
        type: [Number],
        default : []
    },

    // encrypted: {
    //     type: Boolean,
    //     required: true
    // },

    script_id: {
        type: String,
        required: true,
    },

    script_name: {
        type: String,
        required: true,
    },

	uploaded_by: {
		type: String,
        required: true,
	},
});

module.exports = mongoose.model("Script", ScriptSchema);
