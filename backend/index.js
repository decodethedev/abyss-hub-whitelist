require("dotenv").config();

const express = require('express');
const mongoose = require("mongoose");

const path = require("path");
const fs = require("fs");

const app = express();

const Counter = require("./models/Counter");
const License = require("./models/License");

const uri = "";

var directoryPath = path.join(__dirname, "routes");

fs.readdir(directoryPath, function (err, files) {
	if (err) {
		return console.log("Unable to scan directory: " + err);
	}
	files.forEach(function (file) {
		if (file.endsWith(".js")) {
			const route = require("./routes/" + file);
			app.use(`/${file.split(".")[0]}`, route);
		}
	});
});

mongoose.connect(uri, { useNewUrlParser: true }, async () => {
	const counter = await Counter.findOne({ _id: "uid" });

	if (!counter) {
		const counter = new Counter({ _id: "uid", seq: 0 });
		await counter.save();
		console.log("Created UID counter");
	}

	console.log("Connected to DB and counter initialized");
});

app.listen(process.env.PORT, () => {
	console.log("Server is running on port " + process.env.PORT);
});
