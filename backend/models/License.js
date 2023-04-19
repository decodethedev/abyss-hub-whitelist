const mongoose = require("mongoose");

const LicenseSchema = new mongoose.Schema({
	key: {
		type: String,
		required: true,
		unique: true,
	},

    subscription: {
        type: Number,
        required: true,
        default: 0
    },

    created_by: {
        type: String,
        required: true,
    },

	used_up: {
		type: Boolean,
		default: false,
	},

	use_left: {
		type: Number,
		default: 1,
		required: true,
	},

    create_at: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("License", LicenseSchema);
