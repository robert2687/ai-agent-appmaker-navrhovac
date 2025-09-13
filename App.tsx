
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message, Role, Agent, ChatSession, Provider } from './types';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import UserInput from './components/UserInput';
import ErrorDisplay from './components/ErrorDisplay';
import HistorySidebar from './components/HistorySidebar';

const agentSystemInstructions: Record<Agent, string> = {
    [Agent.Default]: 'You are a helpful and friendly AI assistant. Answer user queries clearly and concisely. Use markdown for formatting when it improves readability.',
    [Agent.SystemsArchitect]: `You are a world-class AI Systems Architect. Your purpose is to design comprehensive software architectures from user descriptions. Your response MUST be a conceptual design, not code. It must be professional, detailed, and structured using markdown. Follow this exact outline:

### Functionality
- A description of the system’s main features.

### Data Models
- Definition of entities, relationships, and data formats (e.g., JSON or SQL DDL).

### API Design
- Key endpoints, parameters, and response formats.

### Technology Stack
- Recommended tools, frameworks, and infrastructure.

### User Interaction
- The flow of user actions and screens.`,
    [Agent.BehavioralModeler]: `You are a specialist AI Behavioral Modeler. Create a detailed AI agent persona from user specifications. Your response MUST be structured with markdown using the following format:

### Persona Summary
- A brief, evocative description of the agent's core identity.

### Personality Traits
- A bulleted list of key characteristics (e.g., Encouraging, Analytical, Witty).

### Communication Style
- **Tone**: Describe the overall tone (e.g., professional, casual).
- **Vocabulary**: Note specific word choices or jargon.

### Core Directives
- A numbered list of the agent's primary goals and motivations.

### Example Dialogue
- Provide one clear example of a user-agent interaction that demonstrates the persona.`,
    [Agent.DigitalTwin]: `You are an expert AI specializing in Digital Twin design. Create virtual models of real-world systems from user descriptions. Your response must be technical, precise, and use the following markdown structure:

### System Overview
- A brief description of the real-world system being modeled.

### State Variables
- A bulleted list of the critical variables defining the system's state.

### Data Schema
- A precise data model for the system's state. Use JSON Schema or TypeScript interfaces in a code block.

### Simulation Logic
- A description of core functions governing the twin's behavior, using pseudocode for key algorithms.

### Interaction API
- Key functions or API endpoints for interacting with the digital twin.`,
    [Agent.ApiIntegration]: `You are a senior API Integration AI specialist. Your sole purpose is to provide production-ready code for connecting to external APIs. Your responses must be secure, robust, and easy to understand.

**Output Structure:**
1.  **Dependencies**: List all required libraries or packages (e.g., \`node-fetch\` for older Node.js versions). For modern environments, state if no dependencies are needed.
2.  **Integration Code**: Provide a single, complete, self-contained function for the API call in a markdown code block. Default to TypeScript/Node.js unless specified otherwise. The function MUST include:
    - Clear JSDoc comments explaining parameters, return values, and what it does.
    - Strong typing with TypeScript interfaces where appropriate.
    - Robust error handling for network failures and non-OK HTTP status codes.
    - Secure handling of authentication tokens (e.g., adding a 'Bearer' prefix).
3.  **Usage Example**: Include a brief, clear example of how to call the function, demonstrating a real-world scenario.

**Example of a High-Quality Response for "Save data to an API":**

You should generate a response similar to this structure and quality:

### Dependencies
No external dependencies are required for modern Node.js (v18+) or browser environments as they have built-in \`fetch\`.

### Integration Code
\`\`\`typescript
/**
 * Interface for a generic successful API response.
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Saves data to a specified backend API endpoint.
 *
 * @template TPayload The type of the data payload to send.
 * @template TResponseData The type of data expected in the successful response.
 * @param {string} endpointUrl The full URL of the API endpoint.
 * @param {TPayload} dataToSave The data payload to send.
 * @param {'POST' | 'PUT'} [method='POST'] The HTTP method to use.
 * @param {string} [authToken] Optional bearer token for authentication.
 * @returns {Promise<ApiResponse<TResponseData>>} A promise that resolves with the API response.
 * @throws {Error} Throws an error if the API call fails.
 */
async function saveApplicationData<TPayload extends object, TResponseData = any>(
  endpointUrl: string,
  dataToSave: TPayload,
  method: 'POST' | 'PUT' = 'POST',
  authToken?: string
): Promise<ApiResponse<TResponseData>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = \`Bearer \${authToken}\`;
    }

    const response = await fetch(endpointUrl, {
      method: method,
      headers: headers,
      body: JSON.stringify(dataToSave),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(\`API Error: \${response.status} - \${errorBody || response.statusText}\`);
    }

    const responseData = await response.json();
    return { success: true, message: 'Data saved successfully', data: responseData };
  } catch (error) {
    console.error(\`Error saving data to \${endpointUrl}:\`, error);
    throw new Error(\`Failed to save data: \${error instanceof Error ? error.message : 'Unknown error'}\`);
  }
}
\`\`\`

### Usage Example
\`\`\`typescript
interface Product {
  name: string;
  price: number;
}

async function createNewProduct() {
  const newProduct: Product = {
    name: "Wireless Headphones",
    price: 129.99,
  };
  try {
    const result = await saveApplicationData<Product, any>(
      'https://api.example.com/products',
      newProduct,
      'POST',
      'your_auth_token'
    );
    console.log('Product created:', result.data);
  } catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    }
  }
}

createNewProduct();
\`\`\`
`,
    [Agent.ContentCreator]: `You are an expert Content Creator AI. Your mission is to generate high-quality, engaging written content.

**Instructions:**
- If a user's request is ambiguous, ask clarifying questions about the **target audience**, **desired tone**, and **content format**.
- Structure your output for clarity using markdown (headings, lists, bold text).
- Adapt your writing style precisely to the specified tone.
- For long-form content like a blog post, include a title, introduction, body, and conclusion.`,
    [Agent.Summarizer]: `You are a highly efficient Summarization AI. Your purpose is to distill text into a concise, accurate, and clear summary.

**Output Rules:**
- The summary must be significantly shorter than the original.
- It must faithfully represent the core information without adding new opinions.
- Default to a concise paragraph. Use a bulleted list for complex texts if it improves clarity.`,
    [Agent.AppPreviewer]: `You are 'App Previewer', an expert frontend developer agent. Your sole purpose is to generate a complete, single, self-contained \`index.html\` file that implements a functional and visually appealing web application based on a user's description.

**Strict Output Requirements:**
- **Single File Only**: The entire output MUST be a single \`index.html\` file.
- **Markdown Code Block**: The HTML MUST be enclosed in a single markdown code block of type \`html\`.
- **No Explanations**: Do NOT provide any text, explanation, or commentary outside the code block.

**Implementation Rules:**
- **Styling**: Use Tailwind CSS via its CDN.
- **Functionality**: All JavaScript MUST be inside a single \`<script>\` tag.
- **Self-Contained**: Do not use any external CSS or JS files, except for the Tailwind CDN.`,
    [Agent.CodeCanvas]: `You are 'Code Canvas', an AI expert on a hypothetical 'Code Visualization Application'. Your role is to explain how to use this tool to analyze code. **You do not generate code or visualizations.**

**Your Task:**
When a user describes a code analysis goal, provide step-by-step instructions on how to use the application to achieve it, following this format:
1.  **Goal**: State the user's objective.
2.  **Steps**: Provide a numbered list of clear, actionable steps.
3.  **UI References**: In your steps, refer to the application's UI components (e.g., 'the Dependency Map view', 'the Filter Panel').`,
};

const agentIntroMessages: Record<Agent, string> = {
    [Agent.Default]: "Hello! I'm an AI assistant. With the Gemini provider, you can ask me anything or try generating an image by typing `/imagine <your prompt>`.",
    [Agent.SystemsArchitect]: "Systems Architect at your service. Describe the application you want to build, and I will design its complete architecture.",
    [Agent.BehavioralModeler]: "Behavioral Modeler online. Describe the AI agent you need, and I'll define its personality and behavior.",
    [Agent.DigitalTwin]: "Digital Twin agent ready. Tell me about the system you want to simulate, and I'll construct its virtual model.",
    [Agent.ApiIntegration]: "API Integration specialist here. Name a service, and I'll write the code to connect to it.",
    [Agent.ContentCreator]: "Content Creator ready. Tell me what you need to write—a blog post, an email, or something else?",
    [Agent.Summarizer]: "Summarization agent online. Paste any text, and I will provide a concise summary.",
    [Agent.AppPreviewer]: "I am the App Previewer. Describe an application, and I will generate a fully functional HTML preview of it. For example, 'a pomodoro timer' or 'a simple weather app'.",
    [Agent.CodeCanvas]: "I am Code Canvas. Describe the code you want to analyze, and I will guide you on how to visualize its structure, dependencies, and flow using our advanced tools.",
};

const getInitialStateForProvider = (provider: Provider) => {
    try {
        const savedState = localStorage.getItem(`chatState-${provider}`);
        if (savedState) {
            const parsed = JSON.parse(savedState);
            if (parsed.sessions && parsed.activeSessionIds) {
                return parsed;
            }
        }
    } catch (error) {
        console.error(`Failed to load state for ${provider}`, error);
    }

    // Default initial state
    const sessions = {} as Record<Agent, ChatSession[]>;
    const activeSessionIds = {} as Record<Agent, string>;
    const agentsForProvider = provider === Provider.Gemini ? Object.values(Agent) : [Agent.Default];

    for (const agent of agentsForProvider) {
        const id = `chat-${Date.now()}-${agent}`;
        sessions[agent] = [{
            id,
            title: 'New Chat',
            messages: [{ role: Role.MODEL, content: agentIntroMessages[agent], agent }],
        }];
        activeSessionIds[agent] = id;
    }

    return { sessions, activeSessionIds };
};


const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generationType, setGenerationType] = useState<'text' | 'image' | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [activeProvider, setActiveProvider] = useState<Provider>(Provider.Gemini);
    const [activeAgent, setActiveAgent] = useState<Agent>(Agent.Default);
    const [modelState, setModelState] = useState<Record<string, string>>({
      [Provider.Gemini]: 'gemini-2.5-flash',
      [Provider.HuggingFace]: 'mistralai/Mistral-7B-Instruct-v0.2',
      [Provider.TogetherAI]: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    });
    
    const initialState = getInitialStateForProvider(activeProvider);
    const [sessions, setSessions] = useState<Record<Agent, ChatSession[]>>(initialState.sessions);
    const [activeSessionIds, setActiveSessionIds] = useState<Record<Agent, string>>(initialState.activeSessionIds);
    
    const handleModelChange = (provider: Provider, newModel: string) => {
        setModelState(prevState => ({
            ...prevState,
            [provider]: newModel
        }));
    };

    const aiRef = useRef<GoogleGenAI | null>(null);
    const previousProviderRef = useRef(activeProvider);
    const autosaveStateRef = useRef({ sessions, activeSessionIds, activeProvider });
    const chatInstancesRef = useRef<Map<string, Chat>>(new Map());
    const streamControllerRef = useRef<AbortController | null>(null);


    useEffect(() => {
        setError(null); // Clear previous errors on provider change

        switch(activeProvider) {
            case Provider.Gemini:
                if (process.env.API_KEY) {
                    try {
                        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    } catch (e) {
                        console.error(e);
                        setError(e instanceof Error ? e.message : "Failed to initialize Gemini Client.");
                        aiRef.current = null;
                    }
                } else {
                    setError('Gemini API key not set. Please ensure the API_KEY environment variable is configured.');
                    aiRef.current = null;
                }
                break;
            case Provider.HuggingFace:
                if (!process.env.HUGGING_FACE_TOKEN) {
                    setError('Hugging Face API key not set. Please set the HUGGING_FACE_TOKEN environment variable.');
                }
                break;
            case Provider.TogetherAI:
                if (!process.env.TOGETHER_API_KEY) {
                    setError('Together.AI API key not set. Please set the TOGETHER_API_KEY environment variable.');
                }
                break;
        }
    }, [activeProvider]);

    useEffect(() => {
        const previousProvider = previousProviderRef.current;
        if (previousProvider !== activeProvider) {
            // Save state for the provider we're leaving
            try {
                localStorage.setItem(`chatState-${previousProvider}`, JSON.stringify({ sessions, activeSessionIds }));
            } catch (error) {
                console.error("Failed to save state to localStorage", error);
            }
            
            chatInstancesRef.current.clear(); // Clear cached chat instances on provider change

            // Load state for the new provider
            const newState = getInitialStateForProvider(activeProvider);
            setSessions(newState.sessions);
            setActiveSessionIds(newState.activeSessionIds);

            // If new provider is not Gemini, reset agent to Default
            if (activeProvider !== Provider.Gemini) {
                setActiveAgent(Agent.Default);
            }
            previousProviderRef.current = activeProvider;
        }
    }, [activeProvider, sessions, activeSessionIds]);

    // Save state to localStorage on every change.
    useEffect(() => {
        try {
            localStorage.setItem(`chatState-${activeProvider}`, JSON.stringify({ sessions, activeSessionIds }));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }, [sessions, activeSessionIds, activeProvider]);

    // Autosave chat state at regular intervals as a fallback.
    useEffect(() => {
        autosaveStateRef.current = { sessions, activeSessionIds, activeProvider };
    }, [sessions, activeSessionIds, activeProvider]);

    useEffect(() => {
        const AUTOSAVE_INTERVAL_MS = 15000; // 15 seconds

        const intervalId = setInterval(() => {
            const { sessions, activeSessionIds, activeProvider } = autosaveStateRef.current;
            try {
                localStorage.setItem(`chatState-${activeProvider}`, JSON.stringify({ sessions, activeSessionIds }));
            } catch (error) {
                console.error("Periodic autosave to localStorage failed:", error);
            }
        }, AUTOSAVE_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, []);
    
    const activeSessionId = activeSessionIds[activeAgent];
    const activeSession = sessions[activeAgent]?.find(s => s.id === activeSessionId);

    const updateMessagesInSession = (sessionId: string, updateFn: (messages: Message[]) => Message[]) => {
        setSessions(prev => {
            const agentSessions = prev[activeAgent];
            if (!agentSessions) return prev;
            
            const sessionIndex = agentSessions.findIndex(s => s.id === sessionId);
            if (sessionIndex === -1) return prev;

            const updatedSession = { ...agentSessions[sessionIndex], messages: updateFn(agentSessions[sessionIndex].messages) };
            const newAgentSessions = [...agentSessions];
            newAgentSessions[sessionIndex] = updatedSession;

            return { ...prev, [activeAgent]: newAgentSessions };
        });
    };
    
    const generateTitle = useCallback(async (prompt: string): Promise<string> => {
        if (!aiRef.current) return 'New Chat';
        try {
            const response = await aiRef.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Generate a concise, 4-word or less title for a conversation that starts with this user message: "${prompt}"\n\nDo not include any quotation marks in the title.`,
                config: { temperature: 0.2 }
            });
            return response.text.replace(/["*]/g, '').trim();
        } catch (e) {
            console.error("Title generation failed:", e);
            return 'New Chat';
        }
    }, []);

    const handleGenericStream = async (text: string, provider: Provider, model: string, apiKey: string | undefined, url: string, body: object, parseChunk: (chunk: any) => string, signal: AbortSignal) => {
        if (!apiKey) {
            setError(`${provider} API key not set.`);
            return;
        }
        setGenerationType('text');
        const userMessage: Message = { role: Role.USER, content: text };
        updateMessagesInSession(activeSession.id, (messages) => [...messages, userMessage, { role: Role.MODEL, content: '', agent: activeAgent }]);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify(body),
                signal,
            });
            if (!response.ok || !response.body) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while(true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const jsonStr = line.substring(5).trim();
                        if (jsonStr === '[DONE]') continue;
                        try {
                            const chunk = JSON.parse(jsonStr);
                            const content = parseChunk(chunk);
                            if (content) {
                                updateMessagesInSession(activeSession.id, (messages) => {
                                    const newMessages = [...messages];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage && lastMessage.role === Role.MODEL) {
                                        lastMessage.content += content;
                                    }
                                    return newMessages;
                                });
                            }
                        } catch (e) {
                            console.error('Failed to parse stream chunk:', e);
                        }
                    }
                }
            }
        } catch (e) {
            if (e.name === 'AbortError') {
                console.log('Stream stopped by user.');
                return;
            }
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            const finalError = `Sorry, something went wrong with ${provider}: ${errorMessage}`;
            updateMessagesInSession(activeSession.id, (messages) => messages.slice(0, -1).concat({ role: Role.ERROR, content: finalError }));
            setError(finalError);
        }
    };

    const handleHuggingFaceStream = (text: string, signal: AbortSignal) => {
        const model = modelState[Provider.HuggingFace];
        const apiKey = process.env.HUGGING_FACE_TOKEN;
        return handleGenericStream(
            text, Provider.HuggingFace, model, apiKey,
            `https://api-inference.huggingface.co/models/${model}`,
            { inputs: text, stream: true, parameters: { max_new_tokens: 1024 } },
            (chunk) => chunk?.token?.text ?? '',
            signal
        );
    };

    const handleTogetherAIStream = (text: string, signal: AbortSignal) => {
        const model = modelState[Provider.TogetherAI];
        const apiKey = process.env.TOGETHER_API_KEY;
        const history = activeSession.messages.map(msg => ({ role: msg.role === Role.USER ? 'user' : 'assistant', content: msg.content }));
        return handleGenericStream(
            text, Provider.TogetherAI, model, apiKey,
            'https://api.together.xyz/v1/chat/completions',
            { model, messages: [...history, { role: 'user', content: text }], stream: true, max_tokens: 1024 },
            (chunk) => chunk?.choices?.[0]?.delta?.content ?? '',
            signal
        );
    };

    const handleChatStream = useCallback(async (text: string, signal: AbortSignal) => {
        const ai = aiRef.current;
        if (!ai || !activeSession) {
            setError("Chat session is not ready. Please check your API key and refresh.");
            return;
        }

        setGenerationType('text');
        const userMessage: Message = { role: Role.USER, content: text };
        
        updateMessagesInSession(activeSession.id, (messages) => [...messages, userMessage, { role: Role.MODEL, content: '', agent: activeAgent }]);

        try {
            let chat = chatInstancesRef.current.get(activeSession.id);
            if (!chat) {
                const historyForApi = activeSession.messages
                    .filter(m => m.role === 'user' || m.role === 'model')
                    .map(msg => ({
                        role: msg.role === Role.USER ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    }));

                chat = ai.chats.create({
                    model: modelState[Provider.Gemini],
                    config: { systemInstruction: agentSystemInstructions[activeAgent] },
                    history: historyForApi
                });
                chatInstancesRef.current.set(activeSession.id, chat);
            }
            
            const stream = await chat.sendMessageStream({ message: text });

            for await (const chunk of stream) {
                if (signal.aborted) {
                    console.log('Stream stopped by user.');
                    break;
                }
                const chunkText = chunk.text;
                if (chunkText) {
                    updateMessagesInSession(activeSession.id, (messages) => {
                         const newMessages = [...messages];
                         const lastMessage = newMessages[newMessages.length - 1];
                         if (lastMessage && lastMessage.role === Role.MODEL) {
                             lastMessage.content += chunkText;
                         }
                         return newMessages;
                    });
                }
            }
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            const finalError = `Sorry, something went wrong: ${errorMessage}`;
            updateMessagesInSession(activeSession.id, (messages) => messages.slice(0, -1).concat({ role: Role.ERROR, content: finalError }));
            setError(finalError);
        }
    }, [activeAgent, activeSession, modelState]);

    const handleImageGeneration = useCallback(async (prompt: string) => {
        if (!aiRef.current || !activeSession) {
            setError("AI Client is not initialized.");
            return;
        }
        if (!prompt) {
            setError("Please provide a prompt for the image.");
            return;
        }
        setGenerationType('image');
        const userMessage: Message = { role: Role.USER, content: `/imagine ${prompt}` };
        updateMessagesInSession(activeSession.id, messages => [...messages, userMessage]);
    
        try {
            const response = await aiRef.current.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
            });
            const imageUrls = response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
            const modelMessage: Message = { role: Role.MODEL, content: '', imageUrls, agent: Agent.Default };
            updateMessagesInSession(activeSession.id, messages => [...messages, modelMessage]);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            const finalError = `Sorry, something went wrong while generating the image: ${errorMessage}`;
            updateMessagesInSession(activeSession.id, messages => [...messages, { role: Role.ERROR, content: finalError }]);
            setError(finalError);
        }
    }, [activeSession]);

    const handleSendMessage = useCallback(async (text: string) => {
        if (isLoading || isStreaming || !text.trim() || !activeSession) return;

        setIsLoading(true);
        setError(null);
        
        const isNewChat = activeSession.messages.length === 1;
        const trimmedText = text.trim();

        const controller = new AbortController();
        streamControllerRef.current = controller;

        try {
            if (trimmedText.toLowerCase().startsWith('/imagine ')) {
                if (activeProvider === Provider.Gemini) {
                    const prompt = trimmedText.substring(8).trim();
                    await handleImageGeneration(prompt);
                } else {
                    const errMessage = { role: Role.ERROR, content: "Image generation is only available with the Gemini provider." };
                    updateMessagesInSession(activeSession.id, msgs => [...msgs, {role: Role.USER, content: trimmedText}, errMessage]);
                }
            } else {
                 setIsStreaming(true);
                 switch(activeProvider) {
                    case Provider.Gemini:
                        await handleChatStream(trimmedText, controller.signal);
                        break;
                    case Provider.HuggingFace:
                        await handleHuggingFaceStream(trimmedText, controller.signal);
                        break;
                    case Provider.TogetherAI:
                        await handleTogetherAIStream(trimmedText, controller.signal);
                        break;
                }
            }
    
            if (isNewChat && activeProvider === Provider.Gemini) {
                const newTitle = await generateTitle(trimmedText);
                setSessions(prev => {
                    const newAgentSessions = prev[activeAgent].map(s => s.id === activeSession.id ? { ...s, title: newTitle } : s);
                    return { ...prev, [activeAgent]: newAgentSessions };
                });
            }
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            setGenerationType(null);
            streamControllerRef.current = null;
        }
    }, [isLoading, isStreaming, activeProvider, activeAgent, activeSession, generateTitle, handleChatStream, handleImageGeneration, modelState]);
    
    const handleStopGeneration = useCallback(() => {
        if (streamControllerRef.current) {
            streamControllerRef.current.abort();
        }
    }, []);

    const handleNewChat = useCallback(() => {
        const agentForNewChat = activeProvider === Provider.Gemini ? activeAgent : Agent.Default;
        const newSession: ChatSession = {
            id: `chat-${Date.now()}`,
            title: 'New Chat',
            messages: [{
                role: Role.MODEL,
                content: agentIntroMessages[agentForNewChat],
                agent: agentForNewChat,
            }],
        };
        setSessions(prev => ({ ...prev, [agentForNewChat]: [newSession, ...(prev[agentForNewChat] || [])] }));
        setActiveSessionIds(prev => ({ ...prev, [agentForNewChat]: newSession.id }));
    }, [activeProvider, activeAgent]);
    
    const handleSelectSession = useCallback((sessionId: string) => {
        setActiveSessionIds(prev => ({ ...prev, [activeAgent]: sessionId }));
    }, [activeAgent]);

    const handleDeleteSession = useCallback((sessionId: string) => {
        chatInstancesRef.current.delete(sessionId);
        setSessions(prevSessions => {
            const currentAgentSessions = prevSessions[activeAgent] || [];
            const newAgentSessions = currentAgentSessions.filter(s => s.id !== sessionId);

            if (activeSessionId === sessionId) {
                if (newAgentSessions.length > 0) {
                    setActiveSessionIds(prevIds => ({ ...prevIds, [activeAgent]: newAgentSessions[0].id }));
                } else {
                    const agentForNewChat = activeProvider === Provider.Gemini ? activeAgent : Agent.Default;
                    const newSession: ChatSession = {
                        id: `chat-${Date.now()}`,
                        title: 'New Chat',
                        messages: [{
                            role: Role.MODEL,
                            content: agentIntroMessages[agentForNewChat],
                            agent: agentForNewChat,
                        }],
                    };
                    setActiveSessionIds(prevIds => ({ ...prevIds, [activeAgent]: newSession.id }));
                    return { ...prevSessions, [activeAgent]: [newSession] };
                }
            }

            return { ...prevSessions, [activeAgent]: newAgentSessions };
        });
    }, [activeAgent, activeSessionId, activeProvider]);

    const handleExportChat = useCallback(() => {
        if (!activeSession) return;

        const title = activeSession.title.replace(/\s/g, '_');
        const timestamp = new Date().toISOString();

        const formattedContent = activeSession.messages.map(message => {
            if (message.role === Role.USER) {
                return `### User\n\n${message.content}`;
            } else if (message.role === Role.MODEL) {
                const agentName = message.agent || 'Model';
                let content = `### ${agentName}\n\n`;
                if (message.content) {
                    content += message.content;
                }
                if (message.imageUrls && message.imageUrls.length > 0) {
                    content += '\n\n' + message.imageUrls.map(url => `![Generated Image](${url})`).join('\n');
                }
                return content;
            }
            return '';
        }).filter(Boolean).join('\n\n---\n\n');

        const blob = new Blob([formattedContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-${title}-${timestamp}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [activeSession]);

    return (
        <div className="flex h-screen bg-gray-900 font-sans text-white">
            <div className={`flex-shrink-0 bg-gray-800 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
                <HistorySidebar 
                    isOpen={isSidebarOpen}
                    sessions={sessions[activeAgent] || []}
                    activeSessionId={activeSessionId}
                    onSelectSession={handleSelectSession}
                    onNewChat={handleNewChat}
                    onDeleteSession={handleDeleteSession}
                    agent={activeAgent}
                    provider={activeProvider}
                />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <Header 
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    activeAgent={activeAgent} 
                    onAgentChange={setActiveAgent}
                    activeProvider={activeProvider}
                    onProviderChange={setActiveProvider}
                    modelState={modelState}
                    onModelChange={handleModelChange}
                    onExportChat={handleExportChat}
                />
                {error && !activeSession?.messages.some(m => m.role === Role.ERROR) && <ErrorDisplay message={error} />}
                <ChatWindow 
                    messages={activeSession?.messages || []} 
                    isLoading={isLoading} 
                    generationType={generationType} 
                    activeAgent={activeAgent}
                    onSendMessage={handleSendMessage}
                />
                <UserInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading} 
                    isStreaming={isStreaming}
                    onStopGeneration={handleStopGeneration}
                    activeAgent={activeAgent} 
                    activeProvider={activeProvider} 
                />
            </div>
        </div>
    );
};

export default App;