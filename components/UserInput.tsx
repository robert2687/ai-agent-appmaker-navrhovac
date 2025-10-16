import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Agent, Provider } from '../types';
import SendIcon from './icons/SendIcon';
import StopIcon from './icons/StopIcon';

/**
 * @interface UserInputProps
 * @description Props for the UserInput component.
 */
interface UserInputProps {
    /** Callback function to send a message. */
    onSendMessage: (text: string) => void;
    /** Boolean indicating if a message is currently being sent or generated. */
    isLoading: boolean;
    /** Boolean indicating if a response is currently being streamed. */
    isStreaming: boolean;
    /** Callback function to stop a streaming generation. */
    onStopGeneration: () => void;
    /** The currently active AI agent, used for placeholder text. */
    activeAgent: Agent;
    /** The currently active AI provider, used for placeholder text. */
    activeProvider: Provider;
}

/**
 * A mapping of agents to their specific placeholder text for the Gemini provider.
 * @type {Record<Agent, string>}
 */
const geminiPlaceholders: Record<Agent, string> = {
    [Agent.Default]: "Type a message or /imagine <prompt>...",
    [Agent.SystemsArchitect]: "e.g., I want to build an AI fitness trainer",
    [Agent.BehavioralModeler]: "e.g., Design a personality for a witty trivia host AI",
    [Agent.DigitalTwin]: "e.g., Model the cash flow for a small coffee shop",
    [Agent.ApiIntegration]: "e.g., Write a function to get the weather for Paris",
    [Agent.ContentCreator]: "e.g., Write a blog post about the benefits of AI",
    [Agent.Summarizer]: "e.g., Paste a long article here to summarize it",
    [Agent.AppPreviewer]: "e.g., A pomodoro timer with start, stop, and reset buttons",
    [Agent.CodeCanvas]: "e.g., How can I visualize the dependencies in my project?",
};

const UserInput: React.FC<UserInputProps> = ({ onSendMessage, isLoading, isStreaming, onStopGeneration, activeAgent, activeProvider }) => {
    const [text, setText] = useState('');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const getPlaceholder = () => {
        if (activeProvider === Provider.Gemini) {
            return geminiPlaceholders[activeAgent];
        }
        return `Message ${activeProvider}...`;
    };

    const handleSend = () => {
        if (text.trim() && !isLoading) {
            onSendMessage(text);
            setText('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    useEffect(() => {
        const textArea = textAreaRef.current;
        if (textArea) {
            textArea.style.height = 'auto';
            const scrollHeight = textArea.scrollHeight;
            textArea.style.height = `${scrollHeight}px`;
        }
    }, [text]);

    return (
        <footer className="bg-gray-800/70 backdrop-blur-sm border-t border-gray-700 p-4">
            <div className="max-w-4xl mx-auto flex items-start gap-4">
                <textarea
                    ref={textAreaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={getPlaceholder()}
                    className="flex-1 bg-gray-900 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none transition-all duration-200 disabled:opacity-50"
                    rows={1}
                    style={{ maxHeight: '200px' }}
                    disabled={isLoading}
                    aria-label="Chat input"
                />
                {isStreaming ? (
                    <button
                        onClick={onStopGeneration}
                        className="bg-red-600 text-white rounded-full p-3 hover:bg-red-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0 self-end"
                        aria-label="Stop generating"
                        title="Stop generating"
                    >
                        <StopIcon />
                    </button>
                ) : (
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !text.trim()}
                        className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0 self-end"
                        aria-label="Send message"
                    >
                        <SendIcon />
                    </button>
                )}
            </div>
        </footer>
    );
};

export default UserInput;