import { sendMessageToGemini } from '../firebase/AI';

export class ChatInterface {
    constructor(scene) {
        this.scene = scene;
        this.chatContainer = document.getElementById('chat-container');
        this.chatHistory = document.getElementById('chat-history');
        this.chatInput = document.getElementById('chat-input');
        this.chatSendButton = document.getElementById('chat-send');
        this.isVisible = false;
        this.currentPersona = null; // Store current persona
        this.currentNpcId = null;   // Store current NPC ID
        this.conversationHistory = new Map(); // Store history keyed by NPC ID

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

    setPersona(persona, npcId) {
        // If we are already talking to this NPC, do nothing (or just ensure UI is shown)
        if (this.currentNpcId === npcId) return;

        this.currentPersona = persona;
        this.currentNpcId = npcId;

        // Clear current view
        if (this.chatHistory) {
            this.chatHistory.innerHTML = '';
        }

        // Restore history if it exists
        const history = this.conversationHistory.get(npcId) || [];

        if (history.length > 0) {
            history.forEach(msg => {
                // Re-render message without animation for history
                this.renderMessageToDOM(msg.sender, msg.text, msg.type, false);
            });
        } else {
             // New interaction - Trigger greeting
            this.triggerGreeting(persona, npcId);
        }
    }

    async triggerGreeting(persona, npcId) {
        const loadingId = this.addLoadingMessage();

        try {
            // Narrative trigger for the AI
            const aiData = await sendMessageToGemini("(The player approaches you)", persona);

            // If the user managed to switch NPCs while waiting, abort adding message
            if (this.currentNpcId !== npcId) {
                // We don't remove loading message here because innerHTML was likely cleared
                return;
            }

            this.removeMessage(loadingId);
            this.addMessage('NPC', aiData.response, 'npc-message', true);

            if (aiData.action && aiData.action.type !== 'none') {
                 setTimeout(() => {
                    alert(`Action Triggered: ${aiData.action.type}\nDetails: ${JSON.stringify(aiData.action)}`);
                }, 500);
            }

        } catch (error) {
            console.error("Failed to get greeting", error);
            if (this.currentNpcId === npcId) {
                this.removeMessage(loadingId);
            }
        }
    }

    async handleSendMessage() {
        if (!this.chatInput) return;

        const userMessage = this.chatInput.value.trim();
        if (!userMessage) return;

        // Add to history and DOM
        this.addMessage('You', userMessage, 'user-message');
        this.chatInput.value = '';

        const loadingId = this.addLoadingMessage();

        try {
            // Retrieve conversation history for context (optional, if you want AI to remember)
            // For now just sending single prompt, but we could send history here too.
            const aiData = await sendMessageToGemini(userMessage, this.currentPersona);

            this.removeMessage(loadingId);
            this.addMessage('NPC', aiData.response, 'npc-message', true);

            if (aiData.action && aiData.action.type !== 'none') {
                setTimeout(() => {
                    alert(`Action Triggered: ${aiData.action.type}\nDetails: ${JSON.stringify(aiData.action)}`);
                }, 500);
            }

        } catch (error) {
            console.error("Failed to get response", error);
            this.removeMessage(loadingId);
            this.addMessage('System', 'Error communicating with AI.', 'npc-message');
        }
    }

    addLoadingMessage() {
        if (!this.chatHistory) return null;

        const id = 'loading-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.id = id;
        messageDiv.className = 'message npc-message loading-message';
        messageDiv.innerHTML = `<strong>NPC:</strong> <span class="loading-dots">Thinking</span>`;

        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;

        return id;
    }

    removeMessage(id) {
        if (!id) return;
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    addMessage(sender, text, type, animate = false) {
        // Store in history
        if (this.currentNpcId) {
            const history = this.conversationHistory.get(this.currentNpcId) || [];
            history.push({ sender, text, type });
            this.conversationHistory.set(this.currentNpcId, history);
        }

        this.renderMessageToDOM(sender, text, type, animate);
    }

    renderMessageToDOM(sender, text, type, animate = false) {
        if (!this.chatHistory) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `<strong>${sender}:</strong>`;
        const textSpan = document.createElement('span');
        messageDiv.appendChild(textSpan);

        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;

        const fullText = " " + text;

        if (animate) {
            let index = 0;
            const speed = 20; // ms per char

            const typeChar = () => {
                if (index < fullText.length) {
                    textSpan.textContent += fullText.charAt(index);
                    index++;
                    // Only scroll if we are near bottom? Or just force it.
                    // Accessing DOM in loop might be slow but OK for typing.
                    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
                    setTimeout(typeChar, speed);
                }
            };
            typeChar();
        } else {
            textSpan.textContent = fullText;
        }
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
