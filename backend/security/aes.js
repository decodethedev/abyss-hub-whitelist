const crypto = require("crypto")

const algorithm = 'aes-256-cbc';
const key = "Y_63#UgGBz-jsLaU&w9$5mb+h@n=bHb6"
const iv = "CWu#UD)Z<:j#cmWN"

function aes_enc(data) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    const content = encrypted.toString('base64');
    return content
}

function aes_dec(data) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrpyted = Buffer.concat([decipher.update(data, 'base64'), decipher.final()]);
    return decrpyted.toString();
}

module.exports = {
    aes_enc,
    aes_dec
}
