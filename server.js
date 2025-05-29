require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

let prompt = `I am a proficient english speaker, but would like to expand my english vocabulary.
Give me three new words that I should add to my vocabulary, including the definition and one or more sentences using the word.
Format the response as follows:
[Example Start]
- <Word 1>:<word class>: <definition1>; <definition2>
. <example sentence1>
. <sentence2>
. <sentence3>
- <Word 2>:<word class> <definition1>; <definition2>
. <example sentence1>
. <sentence2>
. <sentencie3>
[Example End]
Replace everything in brackets (<>) with the actual words, definitions and sentences.
Note how lines with a new word definition start with a dash (-) and lines with example sentences start with a dot (.).
Do not response with anything other than the answer in the above format.`

let cache = {
    response: null,
    lastFetchDate: null
};

// Function to get today's date in YYYY-MM-DD format
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Function to check if we need to fetch new data
function shouldFetchNewData() {
    const today = getTodayDate();
    return !cache.lastFetchDate || cache.lastFetchDate !== today;
}

// Function to fetch LLM response
async function fetchLLMResponse() {
    try {
        if (!process.env.LLM_API_ENDPOINT || !process.env.LLM_API_KEY) {
            throw new Error('LLM API configuration missing');
        }

        console.log(prompt);

        const response = await fetch(process.env.LLM_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LLM_API_KEY}`
            },
            body: JSON.stringify({
                model: "mistral-medium-2505",
                messages: [{
                    role: "user",
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch LLM response: ${errorText}`);
        }

        const data = await response.json();
        console.log(data.choices[0].message);

        const llmResponseText = data.choices[0].message.content;
       
        console.log("Text: " + llmResponseText)

        // Parse the response into structured data
        const words = [];
        const wordBlocks = llmResponseText.split('- ').filter(block => block.trim());
        
        for (const block of wordBlocks) {
            const [wordLine, ...sentenceLines] = block.split('\n').filter(line => line.trim());
            const [word, wordClass, definitions] = wordLine.split(':').map(part => part.trim());
            
            const sentences = sentenceLines
                .filter(line => line.trim().startsWith('.'))
                .map(line => line.trim().substring(1).trim());
           
            console.log("word: " + word)
            console.log("definitions: " + definitions)

            words.push({
                word: word.replaceAll("*", ""),
                class: wordClass,
                definitions: definitions.split(';').map(def => def.trim()),
                sentences
            });
        }

        return words;
    } catch (error) {
        console.error('Error fetching LLM response:', error);
        return 'Unable to fetch today\'s insight. Please try again later.';
    }
}

app.get('/api/words', async (req, res) => {
    if (shouldFetchNewData()) {
        try {
            cache.response = await fetchLLMResponse();
            cache.lastFetchDate = getTodayDate();
        } catch (error) {
            console.error('Error updating words of the day:', error);
            return res.status(500).json({ error: 'Failed to fetch words of the day' });
        }
    }
    
    res.json({
        response: cache.response,
        lastFetchDate: cache.lastFetchDate
    });
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
}); 