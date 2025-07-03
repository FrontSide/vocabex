require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const { saveResponse, getLatestNResponses } = require('./db');
const VERSION = require('./version');
const app = express();
const port = process.env.PORT || 3000;

function buildPrompt(wordsToExclude) {
    return `I am a proficient english speaker, but would like to expand my english vocabulary.
    Give me three new words that I should add to my vocabulary, including the definition and one or more sentences using the word.
    Do not include the following words, as we just recently learned those: ${wordsToExclude}
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
}

function getTodayDate() {
    return new Date().toISOString();
}

function shouldFetchNewData(lastFetchDate) {
    console.log(`Check if we should fetch new: ${lastFetchDate}`)
    if (!lastFetchDate) return true;
    const today = new Date().toISOString().split('T')[0];
    return lastFetchDate.split('T')[0] !== today;
}

async function fetchLLMResponse(latestResponses) {
    try {
        if (!process.env.LLM_API_ENDPOINT || !process.env.LLM_API_KEY) {
            throw new Error('LLM API configuration missing');
        }

        if (latestResponses == null) {
            latestResponses = []
        }
        let wordsToExclude = []
        for (let oneOfLatestResponses of latestResponses) {
            for (let wordResponse of oneOfLatestResponses.response) {
                wordsToExclude.push(wordResponse.word)
            }
        }

        let prompt = buildPrompt(wordsToExclude.join(','))
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
        return 'Unable to fetch today\'s words. Please try again later.';
    }
}

app.get('/vocabex/api/words', async (req, res) => {
    try {
        
        const latestWords = await getLatestNResponses(3);

        console.log(`latest words is: ${JSON.stringify(latestWords)}`)
        
        if (latestWords.length == 0 || shouldFetchNewData(latestWords[0].fetch_date)) {
            const fullResponse = await fetchLLMResponse(latestWords);
            const fetchDate = getTodayDate();
            
            await saveResponse(fetchDate, fullResponse);
            
            res.json({
                response: fullResponse,
                lastFetchDate: fetchDate
            });
        } else {
            console.log("Using cached response")
            res.json({
                response: latestWords[0].response,
                lastFetchDate: latestWords[0].fetch_date
            });
        }
    } catch (error) {
        console.error('Error handling words request:', error);
        res.status(500).json({ error: 'Failed to fetch words of the day' });
    }
});

app.get('/vocabex/api/words/history', async (req, res) => {
    try {
        const latestResponses = await getLatestNResponses(100);
        let recordedWords = [] 
        const allWords = latestResponses.flatMap(response => 
            response.response.filter(word => !recordedWords.includes(word.word)).map(word => {
                recordedWords.push(word.word);
                return { 
                    word: word.word,
                    class: word.class,
                    fetchDate: response.fetch_date,
                    definitions: word.definitions,
                    sentences: word.sentences
                }
            })
        );
        res.json(allWords);
    } catch (error) {
        console.error('Error fetching word history:', error);
        res.status(500).json({ error: 'Failed to fetch word history' });
    }
});

app.get('/vocabex/api/version', (req, res) => {
    res.json({ version: VERSION });
});

// Serve static files
app.use('/vocabex', express.static(path.join(__dirname)));

app.get('/vocabex/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
}); 