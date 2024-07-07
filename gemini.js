const {GoogleGenerativeAI} = require("@google/generative-ai");
const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const {verifyRequestSignature, getWorksApiAccessToken} = require("./jwt-utils");

dotenv.config();

const BOT_ID = process.env.BOT_ID;
const GENERATIVE_AI_API_KEY = process.env.GENERATIVE_AI_API_KEY;

const app = express();
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

app.use(express.json());
app.use(verifyRequestSignature)
app.post('/api/chat', async (req, res) => {
    const prompt = req.body.content.text;
    const channelId = req.body.source.channelId;
    console.log('>>>>> logging ' + channelId)
    console.log(req.body)
    console.log('>>>>> logging ' + channelId)

    // get ai reply
    const result = await model.generateContent(prompt);
    const aiMessage = await result.response;

    // send chat to user-channel
    const botApiUrl = `https://www.worksapis.com/v1.0/bots/${BOT_ID}/channels/${channelId}/messages`
    const authToken = await getWorksApiAccessToken(req, res);
    const botMessage = {
        content: {
            type: 'text',
            text: aiMessage.text() // 2000자 제한 처리 필요
            // text: prompt // 2000자 제한 처리 필요
        }
    };

    try {
        const response = await axios.post(botApiUrl, botMessage, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
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