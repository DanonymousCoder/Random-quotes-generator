import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
};

// Middleware to parse JSON
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

app.post('/generate-ai-quotes', async (req, res) => {
    const { category } = req.body;
    if(!category){
        category='random';
    }
    const prompt = `Generate quotes for the ${category} category and return the response in JSON format with an image prompt for each quote.`;

    try {
        // Start a new chat session
        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [
                        { text: prompt }, // Use the constructed prompt directly
                    ],
                },
                {
                    role: "model",
                    parts: [
                        { text: "```json\n[\n  {\n    \"quote\": \"The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.\",\n    \"image_prompt\": \"A vibrant sunrise over a mountain range, with a warm and inspiring color palette.\"\n  },\n  {\n    \"quote\": \"Success is not final, failure is not fatal: it is the courage to continue that counts.\",\n    \"image_prompt\": \"A strong, determined person hiking up a steep mountain path, with a view of the summit in the distance.\"\n  },\n  {\n    \"quote\": \"Believe you can and you're halfway there.\",\n    \"image_prompt\": \"A person reaching for the stars with a hopeful expression, against a starry night sky.\"\n  },\n  {\n    \"quote\": \"The only limit to our realization of tomorrow will be our doubts of today.\",\n    \"image_prompt\": \"A futuristic city skyline with vibrant colors and futuristic architecture, symbolizing limitless possibilities.\"\n  },\n  {\n    \"quote\": \"The difference between ordinary and extraordinary is that little extra.\",\n    \"image_prompt\": \"A person pushing a boulder uphill with determination, representing the effort needed to reach the extraordinary.\"\n  },\n  {\n    \"quote\": \"Challenges are what make life interesting. Overcoming them is what makes life meaningful.\",\n    \"image_prompt\": \"A climber scaling a rock face, facing a challenging but rewarding climb.\"\n  },\n  {\n    \"quote\": \"Your time is limited, so don't waste it living someone else's life.\",\n    \"image_prompt\": \"A person standing at a crossroads, with multiple paths leading in different directions, symbolizing choices and possibilities.\"\n  },\n  {\n    \"quote\": \"The only person you are destined to become is the person you decide to be.\",\n    \"image_prompt\": \"A silhouette of a person standing tall and confident against a backdrop of a bright and colorful sunrise.\"\n  },\n  {\n    \"quote\": \"Don't be afraid to give up the good to go for the great.\",\n    \"image_prompt\": \"A person jumping from a high cliff into a beautiful waterfall, symbolizing taking a leap of faith.\"\n  },\n  {\n    \"quote\": \"The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.\",\n    \"image_prompt\": \"A soft, peaceful scene with a close-up of a person's hand holding a flower, emphasizing the beauty of nature.\"\n  }\n]\n``` \n" },
                    ],
                },
            ],
        });

        // Send the message to the chat session
        const response = await chatSession.sendMessage(prompt);

        // Get the text response from the model
        const quotesResponse = response?.response?.text();

        if (quotesResponse) {
            // Remove any Markdown formatting (backticks) if necessary
            const cleanedResponse = quotesResponse.replace(/```json|```/g, '').trim();
            const quotesJSON = JSON.parse(cleanedResponse);
            res.json({ quotes: quotesJSON });
        } else {
            throw new Error('No response text received from the model');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate AI quotes', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
