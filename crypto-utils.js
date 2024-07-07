const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');
const axios = require("axios");

dotenv.config();

const BOT_SECRET = process.env.BOT_SECRET;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SERVICE_ACCOUNT = process.env.SERVICE_ACCOUNT;

function verifyRequestSignature(req, res, next) {
    // 요청 본문을 문자열로 변환
    const requestBody = JSON.stringify(req.body);

    // HMAC-SHA256 생성
    const hmac = crypto.createHmac('sha256', BOT_SECRET);
    hmac.update(requestBody);
    const hash = hmac.digest('base64');

    // 요청 헤더에서 XXX_MY_HEADER 값 가져오기 (대소문자 구분 없이)
    const headerKey = Object.keys(req.headers)
        .find(key => key.toLowerCase() === 'x-works-signature');
    const headerValue = req.headers[headerKey];

    // HMAC 결과와 헤더 값 비교
    if (hash === headerValue) {
        next();
    } else {
        res.status(401).send('Invalid Request');
    }
}

async function getWorksApiAccessToken(req, res) {
    try {
        const oAuthUrl = 'https://auth.worksmobile.com/oauth2/v2.0/token';
        const jsonWebToken = encodeJsonWebToken();
        const data = new URLSearchParams();
        data.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
        data.append('client_id', CLIENT_ID);
        data.append('client_secret', CLIENT_SECRET);
        data.append('scope', 'bot.message');
        data.append('assertion', jsonWebToken);

        const response = await axios.post(oAuthUrl, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        // return response.data // TODO check refresh_token, etc...
        return response.data.access_token;
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Internal Server Error');
    }
}

function encodeJsonWebToken() {
    // header
    const header = {
        alg: 'RS256',
        typ: 'JWT'
    };

    // json claim
    const payload = {
        iss: CLIENT_ID,
        sub: SERVICE_ACCOUNT
    };

    // signature
    const privateKeyPath = path.join(__dirname, 'private.key');
    const privateKey = fs.readFileSync(privateKeyPath, {encoding: 'utf8'});

    // generate jwt token
    return jwt.sign(payload, privateKey, {algorithm: 'RS256', expiresIn: '1h'});
}

module.exports = {verifyRequestSignature, getWorksApiAccessToken}