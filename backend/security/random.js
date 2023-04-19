const { randomBytes } = require('crypto');

function getRandomString(length) {
    return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

module.exports = {
    getRandomString
}