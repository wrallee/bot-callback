const {GoogleGenerativeAI} = require("@google/generative-ai");
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.send(text)
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
