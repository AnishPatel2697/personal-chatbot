const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Use the PORT variable set by Heroku
const dialogflow = require('dialogflow');
const uuid = require('uuid');

// Parse the Dialogflow credentials from the environment variable
let dialogflowKey;
try {
    dialogflowKey = JSON.parse(process.env.DIALOGFLOW_KEY);
    console.log("Parsed Dialogflow key successfully:", dialogflowKey);
} catch (error) {
    res.json({ answer: "Oops! Something went wrong. Please try again." });
    return;
}

// Create a session client for Dialogflow using the parsed key from the environment
const sessionClient = new dialogflow.SessionsClient({
    credentials: {
        private_key: dialogflowKey.private_key,
        client_email: dialogflowKey.client_email
    }
});

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
            res.json({ response: "Let's keep this conversation respectful, shall we? 😊" });
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
        res.json({ response: "Oops! Something went wrong. Please try again." });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
