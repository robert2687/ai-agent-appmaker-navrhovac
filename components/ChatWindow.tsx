import React, { useEffect, useRef } from 'react';
import { Agent, Message as MessageType } from '../types';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import ImageLoadingIndicator from './ImageLoadingIndicator';
import WelcomeScreen from './WelcomeScreen';

/**
 * @interface ChatWindowProps
 * @description Props for the ChatWindow component.
 */
interface ChatWindowProps {
    /** An array of messages to be displayed in the chat window. */
    messages: MessageType[];
    /** A boolean indicating if a response is currently being loaded. */
    isLoading: boolean;
    /** The type of content being generated ('text' or 'image'), or null. */
    generationType: 'text' | 'image' | null;
    /** The currently active AI agent. */
    activeAgent: Agent;
    /** Callback function to send a message, used by the WelcomeScreen's prompt examples. */
    onSendMessage: (text: string) => void;
}

/**
 * The main chat interface where messages are displayed.
 * It handles rendering the list of messages, showing loading indicators,
 * and displaying a welcome screen for new chats.
 *
 * @param {ChatWindowProps} props The props for the component.
 * @returns {React.ReactElement} The rendered chat window.
 */
const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, generationType, activeAgent, onSendMessage }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const isNewChat = messages.length <= 1;

    return (
        <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto h-full">
                {isNewChat ? (
                    <WelcomeScreen activeAgent={activeAgent} onPromptClick={onSendMessage} />
                ) : (
                    <>
                        {messages.map((msg, index) => (
                            <Message key={index} message={msg} />
                        ))}
                        {isLoading && generationType === 'text' && <TypingIndicator agent={activeAgent} />}
                        {isLoading && generationType === 'image' && <ImageLoadingIndicator />}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
        </main>
    );
};

export default ChatWindow;