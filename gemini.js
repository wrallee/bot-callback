const {GoogleGenerativeAI} = require("@google/generative-ai");
const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const {getJsonWebToken} = require("./jwt-utils");

dotenv.config();

const BOT_ID = process.env.BOT_ID;
const BOT_SECRET = process.env.BOT_SECRET;
const GENERATIVE_AI_API_KEY = process.env.GENERATIVE_AI_API_KEY;

const app = express();
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const {prompt} = req.body;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;

    const responseMessage = {
        content: {
            type: 'text',
            text: aiResponse.text() // 2000자 제한 처리 필요
        }
    };

    const botApiUrl = `https://www.worksapis.com/v1.0/bots/${BOT_ID}/channels/${channelId}/messages`

    try {
        const response = await axios.post(botApiUrl, responseMessage, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${BOT_SECRET}`
            }
        });
        res.status(200).send('Message sent');
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});