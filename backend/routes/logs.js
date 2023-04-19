const express = require("express");
const bodyParser = require("body-parser");
const { Webhook } = require('discord-webhook-node');

const { verifyToken, signToken } = require("../security/logs-jwt");

const route = express.Router();
route.use(bodyParser.json());

route.use(function(req, res) {
    res.status(404).json({message: "Not found", code: 0});
});

module.exports = route