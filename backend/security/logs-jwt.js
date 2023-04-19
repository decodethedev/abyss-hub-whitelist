const jwt = require('jsonwebtoken');
const jwtLogTokenKey = process.env.JWT_LOG_TOKEN_KEY;

function signToken(data) { 
    const token = jwt.sign(data, jwtLogTokenKey, {expiresIn: '1h'});
    return token;
}

function verifyToken(data) {
    const verified = jwt.verify(data, jwtLogTokenKey);
    return verified;
}

module.exports = {
    signToken,
    verifyToken
}