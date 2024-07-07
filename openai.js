// openai.js
const express = require('express');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Interact with ChatGPT using streaming
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *               maxTokens:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Successful response from ChatGPT
 *       500:
 *         description: Server error
 */
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;

    try {
        const stream = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            stream: true,
        });

        res.setHeader('Content-Type', 'application/octet-stream');

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            res.write(content);
        }
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
