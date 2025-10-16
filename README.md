<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Agent System

This repository contains a versatile and extensible AI chat application that allows users to interact with multiple AI models from different providers. It features a system of specialized "agents," each with a unique purpose and system prompt, providing a tailored experience for various tasks.

## Features

- **Multi-Provider Support**: Seamlessly switch between different AI providers:
  - **Google Gemini**: For advanced text and image generation.
  - **Hugging Face**: Access a wide range of open-source models.
  - **Together.AI**: Leverage powerful models with high performance.
- **Specialized AI Agents**: Choose from a variety of agents for specific tasks, including:
  - **Systems Architect**: Designs software architectures from descriptions.
  - **Content Creator**: Generates high-quality written content.
  - **App Previewer**: Creates functional HTML previews of applications.
  - ...and many more!
- **Chat History**: Automatically saves your conversations to your browser's local storage, organized by provider.
- **Searchable History**: Quickly find past conversations with a built-in search function.
- **Markdown & Code Support**: Renders markdown for rich text formatting and provides syntax highlighting for code blocks.
- **Image Generation**: Generate images with the Gemini provider using the `/imagine` command.
- **Export Chat**: Download your conversation history as a markdown file.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- `npm` (usually comes with Node.js)

### Setup and Configuration

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure API Keys:**
    Create a `.env.local` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env.local
    ```
    Now, open `.env.local` and add your API keys. You only need to provide keys for the providers you intend to use.

    -   **For Gemini**:
        ```
        VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
        ```
        You can get a Gemini API key from [Google AI Studio](https://ai.google.dev/).

    -   **For Hugging Face**:
        ```
        VITE_HUGGING_FACE_TOKEN="YOUR_HUGGING_FACE_API_KEY"
        ```
        Find your token in your [Hugging Face account settings](https://huggingface.co/settings/tokens).

    -   **For Together.AI**:
        ```
        VITE_TOGETHER_API_KEY="YOUR_TOGETHER_AI_API_KEY"
        ```
        Your API key is available in your [Together.AI account settings](https://api.together.ai/settings/api-keys).

### Running the Application

Once your dependencies are installed and your API keys are configured, you can run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## How to Use

-   **Select a Provider**: Use the dropdown at the top to choose your desired AI provider.
-   **Choose an Agent (Gemini only)**: When using the Gemini provider, you can select a specialized agent from the agent dropdown. Each agent is primed with a specific system prompt to excel at its designated task.
-   **Change Models**: Each provider has a dropdown that lets you select from a list of compatible models.
-   **Start a Conversation**: Type your message in the input box at the bottom and press Enter or click the send button.
-   **Generate Images**: When using the Gemini provider, type `/imagine <your prompt>` to generate an image.
-   **Manage Chats**: Use the sidebar to switch between past conversations, start a new chat, or delete old ones.
-   **Export History**: Click the download icon in the header to save your current conversation as a markdown file.
-   **Stop Generation**: If a response is taking too long, you can click the stop button to interrupt the stream.