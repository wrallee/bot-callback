const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_ACCOUNT = process.env.CLIENT_ACCOUNT;

function getJsonWebToken() {
    // header
    const header = {
        alg: 'RS256',
        typ: 'JWT'
    };

    // json claim
    const payload = {
        iss: CLIENT_ID,
        sub: CLIENT_ACCOUNT
    };

    // signature
    const privateKeyPath = path.join(__dirname, 'private.key');
    const privateKey = fs.readFileSync(privateKeyPath, {encoding: 'utf8'});

    // generate jwt token
    return jwt.sign(payload, privateKey, {algorithm: 'RS256', expiresIn: '1h'});
}

module.exports = {getJsonWebToken}