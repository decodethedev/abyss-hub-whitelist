const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.JWT_KEY;

function signJwt(data) { 
    const token = jwt.sign(data, jwtSecretKey);
    return token;
}

function verifyJwt(data) {
    const verified = jwt.verify(data, jwtSecretKey);
    return verified;
}

module.exports = {
    signJwt,
    verifyJwt
}