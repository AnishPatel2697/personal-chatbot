const express = require('express');
const app = express();
const port = 3000;
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const responses = require('./responses.json');

// Import the service account key for Dialogflow
const dialogflowKey = require('./dialogflow-key.json');

// Create a session client for Dialogflow
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: 'dialogflow-key.json'
});

// Endpoint to handle general questions
app.get('/api/chat', async (req, res) => {
    const question = req.query.q.toLowerCase();
    let response = "I'm still learning to answer that! Try asking about my work or hobbies.";

    // Check for inappropriate words
    const bannedWords = ["foulword1", "foulword2", "foulword3"];
    for (let word of bannedWords) {
        if (question.includes(word)) {
            res.json({ answer: "Let's keep this conversation respectful, shall we? 😊" });
            return;
        }
    }

    try {
        // Log the incoming question
        console.log(`Received question: ${question}`);

        // Use Dialogflow to handle the user query
        const sessionId = uuid.v4();
        const sessionPath = sessionClient.sessionPath(dialogflowKey.project_id, sessionId);

        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: question,
                    languageCode: 'en',
                },
            },
        };

        // Log the Dialogflow request
        console.log('Sending request to Dialogflow...');

        const dialogflowResponses = await sessionClient.detectIntent(request);
        const result = dialogflowResponses[0].queryResult;

        // Log the Dialogflow response
        console.log('Received response from Dialogflow:', result.fulfillmentText);

        if (result && result.fulfillmentText) {
            response = result.fulfillmentText;
        }

        res.json({ response });
    } catch (error) {
        console.error("ERROR:", error);
        res.json({ answer: "Oops! Something went wrong. Please try again." });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
