const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI API'ye istek yapan endpoint
app.post('/api/process-query', async (req, res) => {
  try {
    const { query } = req.body;


    const systemPrompt = `
      You are an AI assistant that helps convert natural language queries into structured filters for a candidate database.
      The following filter fields are available:
      - status: String (Active, Interview, Rejected, Offer)
      - city: String
      - education: String
      - minSalary: Number
      - maxSalary: Number
      - minScore: Number
      - maxScore: Number
      - joinDateStart: ISO Date String
      - joinDateEnd: ISO Date String

      Return ONLY a JSON object with these fields, with null for any fields not specified in the query.
      DO NOT include any explanation or additional text.
    `;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.1,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      }
    });

    const responseContent = response.data.choices[0].message.content;

    try {
      // JSON parse
      const parsedResponse = JSON.parse(responseContent);
      res.json(parsedResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      res.status(500).json({ error: 'Failed to parse AI response' });
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});