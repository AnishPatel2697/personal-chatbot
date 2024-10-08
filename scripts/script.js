// script.js

document.addEventListener("DOMContentLoaded", () => {
    const chatBody = document.querySelector(".chat-body");
    const chatInput = document.querySelector(".chat-footer input");
    const sendButton = document.querySelector(".chat-footer button");

    function appendMessage(message, sender) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.classList.add(sender === "user" ? "user-message" : "bot-message");
        messageElement.textContent = message;
        chatBody.appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage === "") return;
        appendMessage(userMessage, "user");
        chatInput.value = "";
        getBotResponse(userMessage);
    }

    function getBotResponse(userMessage) {
        fetch(`/api/chat?q=${encodeURIComponent(userMessage)}`)
            .then(response => response.json())
            .then(data => {
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
});