const { aes_enc, aes_dec } = require("./aes");
const { signJwt, verifyJwt } = require("./jwt");

function verifyIdentifier(identifier) {
    var data;
    try {
        data = verifyJwt(aes_dec(identifier));
    } catch (e) {
        // sends a malfunction log to server (TODO)
        return false;
    }
    return data
}

function createIdentifier(data) {
    var identifier;
    try {
        identifier = aes_enc(signJwt(data));
    } catch (e) {
        // sends a malfunction log to server (TODO)
        return false;
    }
    return identifier
}

module.exports = {
    verifyIdentifier,
    createIdentifier
}