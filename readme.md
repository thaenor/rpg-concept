# Overlord Rising - AI RPG Integration Demo

Game link: https://thaenor.github.io/rpg-concept/

This project demonstrates a 2D RPG game built with **Phaser 3** and **Vite**, integrated with **Google Firebase Vertex AI (Gemini 2.5 Flash)** to create dynamic, persona-driven NPC interactions.

## 🚀 Features

*   **AI-Powered NPCs**: Non-Player Characters are powered by Gemini 2.5 Flash, allowing for dynamic, non-scripted conversations.
*   **Distinct Personas**: unique personalities and system instructions for different NPCs:
    *   **Elder Oak** (Red Square): A wise, nature-loving guide who offers riddles.
    *   **Luna the Merchant** (Green Circle): A shrewd but friendly trader.
    *   **Mystic Sage** (Purple Triangle): A cryptic figure who tests the player.
*   **Context Aware**: The AI knows it is in a game and acts according to its specific role.
*   **Chat Interface**: Custom HTML/CSS overlay for chatting, completely integrated with Phaser's event loop.
*   **Typewriter Effect**: NPC responses are rendered character-by-character for a retro RPG feel.
*   **Conversation History**: The game remembers your chat history with each specific NPC during the session.
*   **Actions System**: The AI can trigger game actions (giving items, starting battles) via JSON structured responses (Debug alerts implemented).
*   **Auto-Greeting**: NPCs initiate the conversation when you approach them for the first time.

## 🛠️ Tech Stack

*   **Runtime/Package Manager**: [Bun](https://bun.sh/) (or Node.js)
*   **Game Engine**: [Phaser 3](https://phaser.io/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **AI/Backend**: [Firebase Vertex AI](https://firebase.google.com/docs/vertex-ai) (Gemini 2.5 Flash)

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd my-phaser-game
    ```

2.  **Install dependencies**:
    ```bash
    bun install
    # or
    npm install
    ```

3.  **Firebase Setup**:
    *   Create a project in the [Firebase Console](https://console.firebase.google.com/).
    *   Enable **Vertex AI in Firebase**.
    *   Create a `.env` file in the root directory with your Firebase configuration keys:
        ```env
        VITE_FIREBASE_API_KEY=your_api_key
        VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
        VITE_FIREBASE_PROJECT_ID=your_project_id
        VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
        VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
        VITE_FIREBASE_APP_ID=your_app_id
        ```

## 🏃‍♂️ Usage

Start the development server:

```bash
bun run dev
# or
npm run dev
```

Open your browser (usually `http://localhost:5173`) to play.

*   **Move**: Arrow Keys
*   **Chat**: Walk close to a shape (NPC) to open the chat window. Type your message and press Enter.

## 📂 Project Structure

```
src/
├── classes/
│   └── ChatInterface.js    # Handles DOM UI, History, and bridging Phaser <-> AI
├── firebase/
│   ├── AI.js               # Vertex AI init, Model config, and Persona definitions
│   └── config.js           # Firebase App initialization
├── scenes/
│   └── Map.js              # Main Game Scene (Player, NPCs, Physics)
└── main.js                 # Phaser Game Config and Entry point
```

## 🧠 AI Integration Logic

1.  **Trigger**: `Map.js` detects collision/proximity between Player and NPC.
2.  **Setup**: It calls `ChatInterface.setPersona(persona, npcId)`.
3.  **Persona**: The specific system instruction (e.g., "You are Elder Oak...") is loaded from `AI.js`.
4.  **Request**: User input (or auto-greeting triggers) is sent to `sendMessageToGemini`.
5.  **Response**:
    *   The prompt is combined with the Persona.
    *   Gemini returns a JSON object containing a `response` (dialogue) and an `action`.
    *   `ChatInterface` displays the dialogue and executes any side effects (Actions).
