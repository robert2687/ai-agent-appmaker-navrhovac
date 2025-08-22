

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Message, Role, Agent, ChatSession, Provider } from './types';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import UserInput from './components/UserInput';
import ErrorDisplay from './components/ErrorDisplay';
import HistorySidebar from './components/HistorySidebar';

const agentSystemInstructions: Record<Agent, string> = {
    [Agent.Default]: 'You are a helpful and friendly AI assistant. Format your responses clearly, using markdown where appropriate.',
    [Agent.SystemsArchitect]: "You are a world-class Systems Architect AI. Your goal is to design the complete end-to-end architecture for software applications based on a user's high-level description. Your response must be structured, detailed, and professional. It should cover: 1. **Core Functionality**: A summary of what the app does. 2. **Data Models/Schema**: Define necessary database schemas or data objects (use JSON or SQL DDL in code blocks). 3. **API Design**: Suggest key API endpoints (e.g., RESTful endpoints). 4. **Technology Stack**: Recommend frontend, backend, and database technologies. 5. **User Interaction Flow**: Describe how a user would interact with the app. Do not write the full application code, but provide a comprehensive blueprint.",
    [Agent.BehavioralModeler]: "You are a specialist AI Behavioral Modeler. Your purpose is to design the personality, communication style, goals, and decision-making logic for AI agents within an application. Based on the user's request, create a detailed persona for the specified AI. Your response should include: 1. **Personality Traits**: A list of key characteristics (e.g., Encouraging, Analytical, Humorous). 2. **Communication Style**: Define the tone and manner of speaking. 3. **Core Directives**: What are the agent's primary goals? 4. **Sample Dialogues**: Provide 2-3 examples of interactions with a user to illustrate the defined behavior. Use markdown for formatting.",
    [Agent.DigitalTwin]: "You are an expert Digital Twin Agent. You specialize in creating virtual models of real-world systems, processes, or objects. Given a user's description, your task is to design the data model and simulation logic for its digital twin. Your output must include: 1. **Data Schema**: A precise data model representing the system's state (use JSON Schema or TypeScript interfaces in code blocks). 2. **Simulation Logic**: Describe the core functions or algorithms that would govern the twin's behavior and state changes. Provide pseudocode or actual code snippets for key simulations (e.g., 'what-if' scenarios). 3. **Interfaces**: Define how one would interact with the digital twin (e.g., function signatures for updating state or running simulations).",
    [Agent.ApiIntegration]: "You are a senior API Integration Agent. Your sole focus is to provide expert, production-ready code for connecting applications to external services and APIs. When a user specifies a service (e.g., Google Maps, OpenAI, a weather API), provide a clean, well-documented code snippet to handle the integration. Your response should: 1. **Specify Language**: Default to TypeScript/Node.js unless another language is requested. 2. **Provide Code**: Write a self-contained function for making the API call, including error handling. 3. **Explain Dependencies**: List any required libraries or packages (e.g., `axios`, `node-fetch`). 4. **Show Usage**: Include a brief example of how to call your function. Use markdown code blocks for all code.",
    [Agent.ContentCreator]: "You are an expert Content Creator AI. Your mission is to generate high-quality, engaging written content based on a user's prompt. Your response should be tailored to the specified format (e.g., blog post, marketing email, product description). Your output should be: 1. **Well-Structured**: Use headings, lists, and markdown for clarity. 2. **Tone-Appropriate**: Adapt your writing style to the target audience. 3. **Engaging**: Write compelling and readable text. For example, if asked for a blog post, include a title, introduction, body, and conclusion.",
    [Agent.Summarizer]: "You are a highly efficient Summarization AI. Your purpose is to distill long pieces of text into concise, easy-to-understand summaries. When a user provides you with text, you must produce a summary that captures the key points and main ideas. Your response should be: 1. **Brief**: Significantly shorter than the original text. 2. **Accurate**: Faithfully represent the core information. 3. **Clear**: Use simple language. You can produce the summary as a short paragraph or a bulleted list of key points.",
    [Agent.AppPreviewer]: "You are an expert frontend developer agent named 'App Previewer'. Your sole purpose is to take a user's high-level description of an application and generate a complete, single, self-contained `index.html` file that implements a functional version of it. The output MUST be a single HTML file inside a markdown code block. Use modern web practices, including responsive design with CSS (inside a `<style>` tag) and interactive functionality with JavaScript (inside a `<script>` tag). Do not include any explanations outside the code block. The generated app should be visually appealing and fully functional.",
    [Agent.CodeCanvas]: "You are 'Code Canvas', an intuitive and insightful AI agent designed to help users understand, analyze, and optimize their code through rich, interactive visualizations. You act as a visual guide, translating abstract code logic into clear, navigable diagrams and charts. Your primary role is to describe how a user would leverage a hypothetical 'Code Visualization Preview Application' to achieve their goals. Your responses must be structured and reference the application's features.\n\n**Core Directives:**\n1.  **Translate Code to Insight**: Explain how to convert code structures (dependencies, call graphs) into visual representations using the app.\n2.  **Guide Visualization Selection**: Assist users in choosing the most appropriate visualization type available in the application (e.g., 'Dependency Map', 'Call Graph', 'Data Flow Diagram').\n3.  **Explain Visualizations**: Clarify the meaning of visual elements and patterns in the diagrams.\n4.  **Enhance Application Usage**: Instruct users on how to use the application's features like the 'Filter Panel', 'Highlighting Options', 'Zoom/Pan Controls', and 'Details Panel'.\n5.  **Facilitate Problem Solving**: Help users identify bugs or architectural issues by guiding them through visual diagnostics.\n\nDo not generate the visualizations themselves. Instead, provide expert guidance on how to use the hypothetical application to create and interpret them. Your communication should be visually descriptive, guidance-oriented, and explicitly reference the app's UI components.",
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
    const [error, setError] = useState<string | null>(null);
    const [generationType, setGenerationType] = useState<'text' | 'image' | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [activeProvider, setActiveProvider] = useState<Provider>(Provider.Gemini);
    const [activeAgent, setActiveAgent] = useState<Agent>(Agent.Default);
    const [modelState, setModelState] = useState<Record<string, string>>({
      [Provider.HuggingFace]: 'mistralai/Mistral-7B-Instruct-v0.2',
      [Provider.TogetherAI]: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    });

    const initialState = getInitialStateForProvider(activeProvider);
    const [sessions, setSessions] = useState<Record<Agent, ChatSession[]>>(initialState.sessions);
    const [activeSessionIds, setActiveSessionIds] = useState<Record<Agent, string>>(initialState.activeSessionIds);
    
    const aiRef = useRef<GoogleGenAI | null>(null);
    const previousProviderRef = useRef(activeProvider);

    useEffect(() => {
        setError(null); // Clear previous errors on provider change

        switch(activeProvider) {
            case Provider.Gemini:
                const geminiApiKey = process.env.GEMINI_API_KEY;
                if (geminiApiKey) {
                    try {
                        aiRef.current = new GoogleGenAI({ apiKey: geminiApiKey });
                    } catch (e) {
                        console.error(e);
                        setError(e instanceof Error ? e.message : "Failed to initialize Gemini Client.");
                        aiRef.current = null;
                    }
                } else {
                    setError('Gemini API key not set. Please set the GEMINI_API_KEY environment variable.');
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

    useEffect(() => {
        try {
            localStorage.setItem(`chatState-${activeProvider}`, JSON.stringify({ sessions, activeSessionIds }));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }, [sessions, activeSessionIds, activeProvider]);
    
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

    const processStream = async (stream: ReadableStream<Uint8Array>, updateChunk: (chunk: string) => void) => {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            updateChunk(text);
        }
    };

    const handleGenericStream = async (text: string, provider: Provider, model: string, apiKey: string | undefined, url: string, body: object, parseChunk: (chunk: any) => string) => {
        if (!apiKey) {
            setError(`${provider} API key not set.`);
            setIsLoading(false);
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
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            const finalError = `Sorry, something went wrong with ${provider}: ${errorMessage}`;
            updateMessagesInSession(activeSession.id, (messages) => messages.slice(0, -1).concat({ role: Role.ERROR, content: finalError }));
            setError(finalError);
        } finally {
            setIsLoading(false);
            setGenerationType(null);
        }
    };

    const handleHuggingFaceStream = (text: string) => {
        const model = modelState[Provider.HuggingFace];
        const apiKey = process.env.HUGGING_FACE_TOKEN;
        return handleGenericStream(
            text,
            Provider.HuggingFace,
            model,
            apiKey,
            `https://api-inference.huggingface.co/models/${model}`,
            { inputs: text, stream: true, parameters: { max_new_tokens: 1024 } },
            (chunk) => chunk?.token?.text ?? ''
        );
    };

    const handleTogetherAIStream = (text: string) => {
        const model = modelState[Provider.TogetherAI];
        const apiKey = process.env.TOGETHER_API_KEY;
        const history = activeSession.messages.map(msg => ({ role: msg.role === Role.USER ? 'user' : 'assistant', content: msg.content }));
        return handleGenericStream(
            text,
            Provider.TogetherAI,
            model,
            apiKey,
            'https://api.together.xyz/v1/chat/completions',
            { model, messages: [...history, { role: 'user', content: text }], stream: true, max_tokens: 1024 },
            (chunk) => chunk?.choices?.[0]?.delta?.content ?? ''
        );
    };

    const handleChatStream = useCallback(async (text: string) => {
        const ai = aiRef.current;
        if (!ai || !activeSession) {
            setError("Chat session is not ready. Please check your API key and refresh.");
            setIsLoading(false);
            return;
        }

        setGenerationType('text');
        const userMessage: Message = { role: Role.USER, content: text };
        
        updateMessagesInSession(activeSession.id, (messages) => [...messages, userMessage, { role: Role.MODEL, content: '', agent: activeAgent }]);

        try {
            const historyForApi = activeSession.messages.map(msg => ({
                role: msg.role === Role.USER ? 'user' : 'model',
                parts: [{ text: msg.content }]
            })).filter(m => m.role === 'user' || m.role === 'model');

            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction: agentSystemInstructions[activeAgent] },
                history: historyForApi
            });
            
            const stream = await chat.sendMessageStream({ message: text });

            for await (const chunk of stream) {
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
        } finally {
            setIsLoading(false);
            setGenerationType(null);
        }
    }, [activeAgent, activeSession]);

    const handleImageGeneration = useCallback(async (prompt: string) => {
        if (!aiRef.current || !activeSession) {
            setError("AI Client is not initialized.");
            setIsLoading(false); return;
        }
        if (!prompt) {
            setError("Please provide a prompt for the image.");
            setIsLoading(false); return;
        }
        setGenerationType('image');
        const userMessage: Message = { role: Role.USER, content: `/imagine ${prompt}` };
        updateMessagesInSession(activeSession.id, messages => [...messages, userMessage]);
    
        try {
            const response = await aiRef.current.models.generateImages({
                model: 'imagen-3.0-generate-002',
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
        } finally {
            setIsLoading(false);
            setGenerationType(null);
        }
    }, [activeSession]);

    const handleSendMessage = useCallback(async (text: string) => {
        if (isLoading || !text.trim() || !activeSession) return;

        setIsLoading(true);
        setError(null);
        
        const isNewChat = activeSession.messages.length === 1;
        const trimmedText = text.trim();

        if (trimmedText.toLowerCase().startsWith('/imagine ')) {
            if (activeProvider === Provider.Gemini) {
                const prompt = trimmedText.substring(8).trim();
                await handleImageGeneration(prompt);
            } else {
                const errMessage = { role: Role.ERROR, content: "Image generation is only available with the Gemini provider." };
                updateMessagesInSession(activeSession.id, msgs => [...msgs, {role: Role.USER, content: trimmedText}, errMessage]);
                setIsLoading(false);
            }
        } else {
             switch(activeProvider) {
                case Provider.Gemini:
                    await handleChatStream(trimmedText);
                    break;
                case Provider.HuggingFace:
                    await handleHuggingFaceStream(trimmedText);
                    break;
                case Provider.TogetherAI:
                    await handleTogetherAIStream(trimmedText);
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
    }, [isLoading, activeProvider, activeAgent, activeSession, generateTitle, handleChatStream, handleImageGeneration, modelState]);
    
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
        setSessions(prev => {
            const newAgentSessions = prev[activeAgent].filter(s => s.id !== sessionId);
            if (activeSessionId === sessionId) {
                 const newActiveId = newAgentSessions.length > 0 ? newAgentSessions[0].id : null;
                 if (newActiveId) {
                    setActiveSessionIds(p => ({...p, [activeAgent]: newActiveId}));
                 } else {
                    handleNewChat();
                 }
            }
            return { ...prev, [activeAgent]: newAgentSessions };
        });
    }, [activeAgent, activeSessionId, handleNewChat]);

    return (
        <div className="flex h-screen bg-slate-900 font-sans text-white">
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
            <div className="flex flex-col flex-1">
                <Header 
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    activeAgent={activeAgent} 
                    onAgentChange={setActiveAgent}
                    activeProvider={activeProvider}
                    onProviderChange={setActiveProvider}
                    modelState={modelState}
                    onModelStateChange={setModelState}
                />
                {error && !activeSession?.messages.some(m => m.role === Role.ERROR) && <ErrorDisplay message={error} />}
                <ChatWindow 
                    messages={activeSession?.messages || []} 
                    isLoading={isLoading} 
                    generationType={generationType} 
                    activeAgent={activeAgent} 
                />
                <UserInput onSendMessage={handleSendMessage} isLoading={isLoading} activeAgent={activeAgent} activeProvider={activeProvider} />
            </div>
        </div>
    );
};

export default App;