const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	_id: {
		type: Number,
	},

	discordID: {
		type: String,
		required: true,
		unique: true,
	},

    discordUser: {
        type: String,
        required: true,
    },

	blacklisted: {
		type: Boolean,
		default: false,
	},

	subscription: {
		type: Number,
		default: 0,
		required: true,
	},

    create_at: {
        type: Date,
        default: Date.now,
    },

	key: {
		type: String,
		required: true,
	},

	licenses: {
		type: [String],
	},

	identifier: {
		type: String,
		default: "NONE",
	},

    identifier_resets: {
        type: [Array],
        default: [],
    },

	favorite_configs: {
		type: [String],
		default: [],
	},

	trial: {
		type: Boolean,
	}
});

module.exports = mongoose.model("User", UserSchema);
