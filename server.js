const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const dialogflow = require('dialogflow');
const uuid = require('uuid');

// Add logging statements for debugging
console.log('Starting server...');

let dialogflowKey;

// Attempt to parse Dialogflow credentials from environment variable
try {
    dialogflowKey = JSON.parse(process.env.DIALOGFLOW_KEY);
    console.log('Parsed Dialogflow key successfully:', dialogflowKey);
} catch (error) {
    console.error('Failed to parse Dialogflow credentials:', error);
}

// Validate the parsed Dialogflow key and ensure `project_id` exists
if (!dialogflowKey || !dialogflowKey.project_id) {
    console.error('Dialogflow key is invalid or missing `project_id`.');
} else {
    console.log('Using project_id:', dialogflowKey.project_id);
}

// Create a session client for Dialogflow
let sessionClient;
if (dialogflowKey && dialogflowKey.project_id) {
    try {
        sessionClient = new dialogflow.SessionsClient({
            credentials: dialogflowKey
        });
        console.log('Session client created successfully.');
    } catch (error) {
        console.error('Failed to create session client:', error);
    }
}

// Add a route for the root URL
app.get('/', (req, res) => {
    res.send("Welcome to Anish's Personal Chatbot! Use /api/chat?q=your-question to chat with me.");
});

// Endpoint to handle general questions
app.get('/api/chat', async (req, res) => {
    const question = req.query.q.toLowerCase();
    let response = "I'm still learning to answer that! Try asking about my work or hobbies.";

    console.log(`Received question: ${question}`);

    if (!sessionClient) {
        console.error('Session client not available. Cannot process the request.');
        res.json({ answer: "Oops! Something went wrong. Please try again." });
        return;
    }

    // Generate a new session ID
    const sessionId = uuid.v4();
    console.log(`Generated sessionId: ${sessionId}`);

    try {
        // Create a session path
        const sessionPath = sessionClient.sessionPath(dialogflowKey.project_id, sessionId);
        console.log('Session path created:', sessionPath);

        // Prepare the request for Dialogflow
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: question,
                    languageCode: 'en',
                },
            },
        };

        console.log('Sending request to Dialogflow...');

        // Send the request to Dialogflow
        const dialogflowResponses = await sessionClient.detectIntent(request);
        const result = dialogflowResponses[0].queryResult;

        console.log('Received response from Dialogflow:', result);

        if (result && result.fulfillmentText) {
            response = result.fulfillmentText;
        }

        res.json({ response });
    } catch (error) {
        console.error('Error occurred while communicating with Dialogflow:', error);
        res.json({ answer: "Oops! Something went wrong. Please try again." });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
