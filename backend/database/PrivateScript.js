const Script = require("../models/PrivateScript");
const fs = require('fs');
const path = require("path");
const { getRandomString } = require("../security/random");

async function getPrivateScriptBy(field, value) {
    const script = await Script.findOne({ [field]: value });
    if (!script) {
        return null;
    }
    return script;
}

async function getPrivateScriptByPlaceID(placeID) {
    const scripts = await Script.find();
    if (!scripts) {
        return null;
    }

    var script = scripts.find(script => script.primary_place_id === placeID);

    if (!script) {
        script = scripts.find(script => script.secondary_place_ids.includes(placeID));

        if (!script) {
            return null
        }
    }

    var filePath = path.resolve(__dirname, '..') + "\\scripts\\" + script.script_id + ".enc"
    var content = fs.readFileSync(filePath, 'utf8');
    
    console.log('File is read successfully on '+ filePath);

    return content
}

async function updatePrivateScript(filter, update) {   
    const script = await Script.findOneAndUpdate(
        filter,
        update
    );
    if (!script) {
        return null;
    }
    return script;
}

async function updatePrivateScriptString(filter, update) {   
    const script = await Script.findOne(
        filter
    );
    if (!script) {
        return null;
    }
    var filePath = path.resolve(__dirname, '..') + "\\scripts\\" + script.script_id + ".enc"
    var content = fs.writeFileSync(filePath, update, 'utf8');
    
    return script;
}

async function getAllPrivateScripts() {
    const scripts = await Script.find();
    if (!scripts) {
        return null;
    }
    return scripts;
}

async function deletePrivateScriptByID(script_id) {
    const script = await Script.findOneAndDelete({ script_id: script_id });
    if (!script) {
        return null;
    }
    return script;
}

async function createPrivateScript(
    script_name,
    uploaded_by,
    primary_place_id,
    script_str,
    encrypted = false,
    secondary_place_ids = [],
    script_id = getRandomString(16),
) {
    const script = new Script({
        script_id: script_id,
        primary_place_id: primary_place_id,
        script_name: script_name,
        uploaded_by: uploaded_by,
        encrypted: encrypted,
        secondary_place_ids: secondary_place_ids,
    });

    const script_enc = script_str;
    var filePath = path.resolve(__dirname, '..') + "\\scripts\\" + script_id + ".enc";

    fs.writeFile(filePath, script_enc, function (err) {
        if (err) throw err;
        console.log('File is created successfully on '+ filePath);
    });

    await script.save();
    console.log("Created script " + script._id);
    return script;
}

module.exports = {getAllPrivateScripts, deletePrivateScriptByID, updatePrivateScriptString ,createPrivateScript, getPrivateScriptBy, updatePrivateScript, getPrivateScriptByPlaceID};