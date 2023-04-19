const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs');

const route = express.Router();
route.use(bodyParser.json());

route.get('/script', (req, res) => {
    fs.readFile('script.lua', (e, data) => {
        if (e) throw e;
        res.send(data);
    });
})

const real_key = "5y1lxXSfWKhlQkSqhUuFyB8kPp8hsCau"

route.get('/files/:filename', (req, res) => {
    const key = req.query.key
    if (!key) return res.send("Fuck off bitch.")

    if (key !== real_key) {
        return res.send("Fuck off bitch.")
    }

    if (fs.existsSync(`./files/${req.params.filename}`)) {
        fs.readFile(`./files/${req.params.filename}`, (e, data) => {
            if (e) throw e;
            res.send(data);
        });
    }
})


route.use(function(req, res) {
    res.status(404).json({message: "Not found", code: 0});
});

module.exports = route