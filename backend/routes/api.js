const express = require("express");
const bodyParser = require("body-parser");

const { create_hmac } = require("../security/hmac");
const { verifyJwt } = require("../security/jwt");
const { aes_enc, aes_dec } = require("../security/aes");
const { verifyIdentifier, createIdentifier } = require("../security/identifier");

const { signToken, verifyToken } = require("../security/logs-jwt");

const { getUserBy, updateUser, getAllUsers, createUser } = require("../database/User");

const { updateScriptString, updateScript, getScriptByPlaceID, deleteScriptByID, getScriptBy, getAllScripts, createScript } = require("../database/Script");
const { getAllPrivateScripts, deletePrivateScriptByID, updatePrivateScriptString ,createPrivateScript, getPrivateScriptBy, updatePrivateScript, getPrivateScriptByPlaceID} = require("../database/PrivateScript");
const { getAllBetaScripts, deleteBetaScriptByID, updateBetaScriptString ,createBetaScript, getBetaScriptBy, updateBetaScript, getBetaScriptByPlaceID} = require("../database/BetaScript");
const { createLicense, getLicenseBy, updateLicense } = require("../database/License")

const { sendSucess, sendFailed, sendMalReport, sendSusLog, sendActivity, } = require("../security/logs");

const route = express.Router();
route.use(bodyParser.json({limit: '50mb'}));

route.get("/test", async (req, res) => {
    return res.send("Hello from api!")

});

route.post("/", async (req, res) => {
    const body = req.body;
    const { token } = body;

    if (!token) {
        return res.status(400).json({message: "Unauthenticated", code: 8});
    }

    const data = verifyToken(token);

    if (!data) {
        return res.status(400).json({message: "Invalid token", code: 9});
    }

    return res.status(200).json({message: "OK", token, code: 0});
});

// SCRIPTS

const APIKEY = process.env.APIKEY;


route.get("/users", async (req, res) => {
    const { discord_id, user_id, secret } = req.query;

    if(!secret || secret !== APIKEY) {
        return res.status(400).json({message: "Unauthenticated", code: 3});
    }


    if (user_id) {
        const user = await getUserBy("_id", parseInt(user_id));
        if (!user) {
            return res.status(400).json({message: "User not found", code: 1});
        }
        res.send(user);
    }
    else if (discord_id) {
        const user = await getUserBy("discordID", discord_id);
        if (!user) {
            return res.status(400).json({message: "User not found", code: 1});
        }
        res.send(user);
    }
    else {
        const users = await getAllUsers();
        res.send(users);
    }
});

route.post("/blacklist", async (req, res) => {
    let { discord_id, toggle, secret } = req.body;
    console.log(toggle)

    if(!secret || secret !== APIKEY) {
        return res.status(400).json({message: "Unauthenticated", code: 3});
    }

    let usr = await getUserBy('discordID', discord_id)
    if (!usr) {
        return res.status(400).json({message: "No user found."})
    }

    if (toggle && usr.blacklisted) {
        return res.status(400).json({message: "User is already blacklisted."})
    } else if (!toggle && !usr.blacklisted) {
        return res.status(400).json({message: "User is not blacklisted."})
    }
    
    usr = await updateUser({discordID: discord_id}, {blacklisted: toggle})
    if (!usr) {
        return res.status(400).json({message: "Failed to perform update."})
    }
    return res.send(usr)
})

route.post("/redeem", async (req, res) => {
    const { license, discord_id, discord_user, secret }  = req.body;

    if(!secret || secret !== APIKEY) {
        return res.status(400).json({message: "Unauthenticated", code: 3});
    }

    var lic = await getLicenseBy("key", license);
    if (!lic) {
        return res.status(400).json({message:"Invalid license", code:4})
    }

    if (lic.used_up || lic.use_left <= 0) {
        await updateLicense({key: license}, {used_up: true, use_left:0})
        return res.status(400).json({message: "License is used up.", code:5})
    }

    var user = await getUserBy("discordID", discord_id)
    if (user) {
        if (user.subscription >= lic.subscription) {
            return res.status(400).json({message: "You are already whitelisted! We've tried to upgrade your account to higher subscription but the license wasn't eligible to do that."})
        } else if (user.subscription < lic.subscription) {
            const subs = ["Normal","Beta","Private"]
            user = await updateUser({discordID:discord_id}, {subscription: user.subscription+1, licenses: [...user.licenses, lic.key]})
            return res.status(200).json({message: `We've upgraded your account subscription to ${subs[user.subscription]}`})
        }
    }
    else {
        await createUser(discord_id, discord_user, false, lic.subscription)
        await updateUser({discordID: discord_id}, {licenses: [lic.key]})
        await updateLicense({key: license},{use_left: lic.use_left-1})

        return res.status(200).json({message: `Successfully whitelisted you for Abyss.`})
    }
})

route.post("/licenses", async (req , res) => {
    const { created_by, amount, secret, subscription, use_left }  = req.body;

    if(!secret || secret !== APIKEY) {
        return res.status(400).json({message: "Unauthenticated", code: 3});
    }

    var licenses = []

    for (let i = 0; i < amount; i++) {
        let license = await createLicense(created_by, subscription, use_left)
        licenses.push(license.key)
    }

    return res.status(200).json({message: "Sent the keys in your DM's!", licenses: licenses})

})

route.get("/scripts", async (req, res) => {
    const { script_id, secret, type, subscription } = req.query;

    if(!secret || secret !== APIKEY) {
        return res.status(400).json({message: "Unauthenticated", code: 3});
    }

    var getall;
    var getby;
    var getbyplaceid;

    if (subscription == 0) {
        getall = getAllScripts;
        getby = getScriptBy;
        getbyplaceid = getScriptByPlaceID;
    } else if (subscription == 1) {
        getall = getAllBetaScripts;
        getby = getBetaScriptBy;
        getbyplaceid = getBetaScriptByPlaceID;
    } else if (subscription == 2) {
        getall = getAllPrivateScripts;
        getby = getPrivateScriptBy;
        getbyplaceid = getPrivateScriptByPlaceID;
    }

    if (!script_id) {
        const scripts = await getall();
        res.send(scripts);
    } else {
        const script = await getby("script_id", script_id);
        if (!script) {
            return res.status(400).json({message: "Script not found", code: 1});
        }
        if (type == 'script_str') {
            var script_str = await aes_dec(getbyplaceid(script.primary_place_id));
            const buff = Buffer.from(script_str, 'ascii');
            script_str = buff.toString('base64');

            return res.json({
                script_id: script.script_id,
                script_str: script_str,
                code: 0
            })
        }
        res.send(script);
    }
});

route.post("/scripts", async (req, res) => {
    const bodyData = req.body;
    const { 
        uploaded_by, 
        script_name, 
        primary_place_id, 
        secondary_place_ids, 
        subscription,
        base64data,
        secret
    } = bodyData;

    if(!secret || secret !== APIKEY) {
        return res.status(400).json({message: "Unauthenticated", code: 3});
    }

    var getby;
    var create_script;

    if (subscription == 0) {
        getby = getScriptBy;
        create_script = createScript;
    } else if (subscription == 1) {
        getby = getBetaScriptBy;
        create_script = createBetaScript;
    } else if (subscription == 2) {
        getby = getPrivateScriptBy;
        create_script = createPrivateScript;
    }

    const buff = Buffer.from(base64data, 'base64');
    const data = buff.toString('ascii');

    const old_script = await getby("script_name", script_name );

    if (old_script) {
        return res.status(400).json({message: "Script already exists", code: 1});
    }

    const script = await create_script(script_name, uploaded_by, primary_place_id, aes_enc(data), secondary_place_ids || []);
    
    res.send(script);
});

route.delete("/scripts", async (req, res) =>{
    const query = req.query;
    const { script_id, secret } = query;

    if (!script_id) {
        return res.status(400).json({message: "Missing script_id", code: 2});
    } else if(!secret || secret !== APIKEY) {
        return res.status(400).json({message: "Unauthenticated", code: 3});
    }

    var getby;
    var deletebyid;

    if (subscription == 0) {
        getby = getScriptBy;
        deletebyid = deleteScriptByID;
    } else if (subscription == 1) {
        getby = getBetaScriptBy;
        deletebyid = deleteBetaScriptByID;
    } else if (subscription == 2) {
        getby = getPrivateScriptBy;
        deletebyid = deletePrivateScriptByID;
    }

    const script = await getby("script_id", script_id);
    if (!script) {
        return res.status(400).json({message: "Script not found", code: 3});
    }

    try{
        await deletebyid(script_id);
    } catch {
        return res.status(400).json({message: "Script not deleted", code: 4});
    }
    
    return res.status(200).json({message: "OK", code: 0});
})

route.post("/scripts-change", async (req, res) =>{
    const query = req.query;
    const data = req.body;

    const { change, type, secret, subscription, script_id } = data;

    if (!script_id) {
        return res.status(400).json({message: "Missing script_id", code: 2});
    } else if (!change) {
        return res.status(400).json({message: "Missing change data", code: 3});
    } else if(!secret || secret !== APIKEY) {
        return res.status(400).json({message: "Unauthenticated", code: 3});
    }

    var getby;
    var updatescriptstring;
    var updatescript;

    if (subscription == 0) {
        getby = getScriptBy;
        updatescriptstring = updateScriptString;
        updatescript = updateScript
    } else if (subscription == 1) {
        getby = getBetaScriptBy;
        updatescriptstring = updateBetaScriptString;
        updatescript = updateBetaScript
    } else if (subscription == 2) {
        getby = getPrivateScriptBy;
        updatescriptstring = updatePrivateScriptString;
        updatescript = updatePrivateScriptString
    }

    const script = await getby("script_id", script_id);
    if (!script) {
        return res.status(400).json({message: "Script not found", code: 3});
    }

    let new_script;

    try{
        if (type != "script_str") {
            new_script = updatescript({ script_id: script_id }, change);
        } else {
            console.log("Changed script.")
            const buff = Buffer.from(change, 'base64');
            const data = buff.toString('ascii');
            new_script = updatescriptstring({ script_id: script_id }, aes_enc(data));
        }
        
    } catch {
        return res.status(400).json({message: "Script not changed", code: 4});
    }
    
    return res.status(200).json({message: "OK", script: new_script, code: 0});
})

route.post("/token", async (req, res) => {
    const body = req.body;
    const { identifier, uid } = body;

    if (!identifier) {
        return res.status(400).json({message: "No identifier provided", code: 7});
    }

    if (!uid) {
        return res.status(400).json({message: "No uid provided", code: 7});
    }

    const user = await getUserBy("key", uid);

    if (!user) {
        return res.status(400).json({message: "Unauthenticated", code: 8});
    }

    const data = verifyIdentifier(identifier);

    if (user.identifier !== data.identifier) {
        return res.status(400).json({message: "Unauthenticated", code: 8});
    }

    if (!data) {
        return res.status(400).json({message: "Unauthenticated", code: 8});
    }

    const token = signToken(data)

    return res.status(200).json({message: "OK", token, code: 0});
});

route.get("/signature", async (req, res) => {
	const headers = req.headers;

    if (!headers["syn-user-identifier"]) {
        return res.status(400).json({message: "No identifier", code: 1});
    } 
    else if (!headers["abyss-data"]) {
        return res.status(400).json({message: "No data", code: 2});
    }

    const identifier = create_hmac(headers["syn-user-identifier"]);
    var data = JSON.parse(aes_dec(headers["abyss-data"]));

    data["identifier"] = identifier;

    const finalIdentifier = createIdentifier(data);

    if (!finalIdentifier) {
        return res.status(400).json({message: "Invalid identifier", code: 3});
    }

    return res.status(200).json({message: "OK", identifier: finalIdentifier, code: 0});
});

route.get("/parse", async (req, res) => {
    const headers = req.headers;
    const identifier = headers.identifier;

    if (!identifier) {
        return res.status(400).json({message: "No identifier", code: 1});
    }

    const data = verifyIdentifier(identifier);

    if (!data) {
        return res.status(400).json({message: "Unauthorized", code: 3});
    }

    return res.status(200).json({message: "OK", data: aes_enc(JSON.stringify(data)), code: 0});
});

route.post("/authenticate", async (req, res) => {
    const body = req.body;
    if (!body) {
        return res.status(400).json({message: "No body", code: 1});
    }

    const identifier = body.identifier;
    const uid = body.uid;
    const version = body.version
    
    if (!identifier) {
        sendFailed(null, "No identifier.", null);
        return res.status(400).json({message: "No identifier", data: aes_enc(JSON.stringify(data)), code: 1});
    }

    const data = verifyJwt(aes_dec(identifier));

    if (!data) {
        sendFailed(null, "No data.", null);
        return res.status(400).json({message: "Unauthorized", data: aes_enc(JSON.stringify(data)), code: 3});
    }

    if (!uid) {
        sendFailed(null, "Invalid user detected.", data);
        return res.status(400).json({message: "No uid", data: aes_enc(JSON.stringify(data)), code: 4});
    }

    var user = await getUserBy("key", uid);
    var newUser = false;

    if (!user) {
        sendFailed(null, "Invalid user detected.", data);
        return res.status(400).json({message: "Unauthorized", data: aes_enc(JSON.stringify(data)), code: 6});
    }

    if (user.identifier === "NONE" && user.trial != false) {
        newUser = true;
        await updateUser({ _id: user._id }, { identifier: data.identifier });
        
        user = await getUserBy("key", uid);

        if (!user) {
            return res.status(400).json({message: "Unauthorized", data: aes_enc(JSON.stringify(data)), code: 6});
        }

        sendActivity(user, "Added identifier for user (maybe new user)")
        console.log("Changed identifier for user: " + user.discordID);
    }

    if (user.blacklisted) {
        sendSusLog(user, "Tried to execute while being blacklisted.");
        return res.status(400).json({message: "Account blacklisted.", data: aes_enc(JSON.stringify(data)), code: 5}); 
    }

    if (user.identifier !== data.identifier && user.trial == false) {
        sendSusLog(user, "Blacklisted for sharing account.");
        const new_usr = await updateUser({ _id: user._id }, { blacklisted: true})
        return res.status(400).json({message: "Blacklisted for sharing account.", data: aes_enc(JSON.stringify(data)), code: 5});
    }

    if (!data.place_id) {
        sendSusLog(user, "No place_id");
        return res.status(400).json({message: "Unauthorized", data: aes_enc(JSON.stringify(data)), code: 7});
    }

    var script;

    if (version > user.subscription) {
        sendFailed(user, "Invalid subscription input (people trying to use a subscription thats higher than theirs)");
        return res.status(401).json({message: "Fuck off nigga you tryna use smth that aint yours :)", data: aes_enc(JSON.stringify(data)), code: 7});
    }

    if (version == 0) {
        script = await getScriptByPlaceID(data.place_id);
    } else if (version == 1) {
        script = await getBetaScriptByPlaceID(data.place_id);
    } else if (version == 2) {
        script = await getPrivateScriptByPlaceID(data.place_id);
    }
    
    if (!script) {
        sendFailed(user, "Unsupported game");
        return res.status(401).json({message: "Unsupported for this version.", data: aes_enc(JSON.stringify(data)), code: 7});
    }

    sendSucess(user);
    return res.status(200).json({message: "OK", script: script, identifier: identifier, data: aes_enc(JSON.stringify(data)), code: 0, newUser: newUser});
});

route.use(function(req, res) {
    res.status(404).json({message: "404: Not Found", code: 5});
});

module.exports = route;