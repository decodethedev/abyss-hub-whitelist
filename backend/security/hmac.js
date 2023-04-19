const sha512 = require('js-sha512');

function create_hmac(data) {
    const secured = sha512.hmac(process.env.HMAC_KEY, data);
    return secured;
}

module.exports = {
    create_hmac
}