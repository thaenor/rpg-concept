import { sendMessageToGemini } from '../firebase/AI';

export class ChatInterface {
    constructor(scene) {
        this.scene = scene;
        this.chatContainer = document.getElementById('chat-container');
        this.chatHistory = document.getElementById('chat-history');
        this.chatInput = document.getElementById('chat-input');
        this.chatSendButton = document.getElementById('chat-send');
        this.isVisible = false;

        // Bind context for event listeners
        this.handleSendMessage = this.handleSendMessage.bind(this);

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.chatSendButton) {
            // Remove existing listeners by cloning (simple but effective for this context)
            const newButton = this.chatSendButton.cloneNode(true);
            this.chatSendButton.parentNode.replaceChild(newButton, this.chatSendButton);
            this.chatSendButton = newButton;

            this.chatSendButton.addEventListener('click', this.handleSendMessage);
        }

        if (this.chatInput) {
            // Remove existing listeners
            const newInput = this.chatInput.cloneNode(true);
            this.chatInput.parentNode.replaceChild(newInput, this.chatInput);
            this.chatInput = newInput;

             this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSendMessage();
                }
            });

            // Prevent Phaser from capturing keys when typing
            this.chatInput.addEventListener('focus', () => {
                if (this.scene && this.scene.input) {
                    this.scene.input.keyboard.enabled = false;
                }
            });

            this.chatInput.addEventListener('blur', () => {
                if (this.scene && this.scene.input) {
                    this.scene.input.keyboard.enabled = true;
                }
            });
        }
    }

    async handleSendMessage() {
        if (!this.chatInput) return;

        const userMessage = this.chatInput.value.trim();
        if (!userMessage) return;

        this.addMessage('You', userMessage, 'user-message');
        this.chatInput.value = '';

        try {
            const aiResponse = await sendMessageToGemini(userMessage);
            this.addMessage('NPC', aiResponse, 'npc-message');
        } catch (error) {
            console.error("Failed to get response", error);
            this.addMessage('System', 'Error communicating with AI.', 'npc-message');
        }
    }

    addMessage(sender, text, type) {
        if (!this.chatHistory) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `<strong>${sender}:</strong>`;
        const textSpan = document.createElement('span');
        textSpan.textContent = " " + text;
        messageDiv.appendChild(textSpan);

        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    show() {
        if (this.chatContainer && !this.isVisible) {
            this.chatContainer.style.display = 'block';
            this.isVisible = true;
        }
    }

    hide() {
        if (this.chatContainer && this.isVisible) {
            this.chatContainer.style.display = 'none';
            this.isVisible = false;
            // Ensure focus is lost so keyboard control returns to game
            if (this.chatInput) {
                this.chatInput.blur();
            }
        }
    }

    isInputActive() {
        return document.activeElement === this.chatInput;
    }
}
