const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));
app.use("/scripts", express.static(path.join(__dirname, "scripts")));
app.use("/styles", express.static(path.join(__dirname, "styles")));

// Dialogflow setup
const key = JSON.parse(process.env.DIALOGFLOW_KEY);
const projectId = key.project_id;
const sessionClient = new dialogflow.SessionsClient({ credentials: key });

// API endpoint to handle chatbot requests
app.get("/api/chat", async (req, res) => {
  const question = req.query.q;

  if (!question) {
    return res.status(400).send({ answer: "Please provide a question." });
  }

  const sessionId = uuid.v4();
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: question,
        languageCode: "en",
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    const fulfillmentText = result.fulfillmentText || "Sorry, I didn't get that. Can you please rephrase?";

    res.status(200).send({ answer: fulfillmentText });
  } catch (error) {
    console.error("Dialogflow error:", error);
    res.status(500).send({ answer: "Oops! Something went wrong. Please try again later." });
  }
});

// Serve the main HTML file for any route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
