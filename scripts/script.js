// script.js

document.addEventListener("DOMContentLoaded", () => {
    const chatBody = document.querySelector(".chat-body");
    const chatInput = document.querySelector(".chat-footer input");
    const sendButton = document.querySelector(".chat-footer button");

    if (!chatBody || !chatInput || !sendButton) {
        console.error("One or more required elements are not found in the DOM.");
        return;
    }

    console.log("Chatbot initialized.");

    function appendMessage(message, sender) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.classList.add(sender === "user" ? "user-message" : "bot-message");
        messageElement.textContent = message;
        chatBody.appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;

        console.log(`${sender === "user" ? "User" : "Bot"}: ${message}`);
    }

    function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage === "") return;

        appendMessage(userMessage, "user");
        chatInput.value = "";

        getBotResponse(userMessage);
    }

    function getBotResponse(userMessage) {
        console.log("Sending message to backend: ", userMessage);

        fetch(`/api/chat?q=${encodeURIComponent(userMessage)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Received response from backend: ", data);
                appendMessage(data.answer, "bot");
            })
            .catch(error => {
                console.error("Error fetching response: ", error);
                appendMessage("Oops! Something went wrong. Please try again.", "bot");
            });
    }

    sendButton.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    console.log("Chatbot event listeners set up.");
});
