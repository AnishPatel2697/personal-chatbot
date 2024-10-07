const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use the PORT variable set by Heroku
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const fs = require('fs');
const responses = require('./responses.json');

// Get the credentials from environment variables
let dialogflowKey;
try {
    dialogflowKey = JSON.parse(process.env.DIALOGFLOW_KEY);
    console.log("Parsed Dialogflow key successfully:", dialogflowKey);
} catch (error) {
    console.error("Error parsing Dialogflow key:", error);
    process.exit(1); // Exit the process if credentials are not parsed successfully
}

// Create a session client for Dialogflow
let sessionClient;
try {
    sessionClient = new dialogflow.SessionsClient({
        credentials: dialogflowKey
    });
    console.log("Session client created successfully.");
} catch (error) {
    console.error("Error creating session client:", error);
    process.exit(1); // Exit the process if session client creation fails
}

// Add a route for the root URL
app.get('/', (req, res) => {
    res.send("Welcome to Anish's Personal Chatbot! Use /api/chat?q=your-question to chat with me.");
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
        console.log("Generated sessionId:", sessionId);
        console.log("Using project_id:", dialogflowKey.project_id);

        const sessionPath = sessionClient.sessionPath(dialogflowKey.project_id, sessionId);
        console.log("Session path generated:", sessionPath);

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
        console.log('Sending request to Dialogflow...', request);

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
