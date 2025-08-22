import React, { useEffect, useRef } from 'react';
import { Agent, Message as MessageType } from '../types';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import ImageLoadingIndicator from './ImageLoadingIndicator';

interface ChatWindowProps {
    messages: MessageType[];
    isLoading: boolean;
    generationType: 'text' | 'image' | null;
    activeAgent: Agent;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, generationType, activeAgent }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-4xl mx-auto">
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                {isLoading && generationType === 'text' && <TypingIndicator agent={activeAgent} />}
                {isLoading && generationType === 'image' && <ImageLoadingIndicator />}
                <div ref={messagesEndRef} />
            </div>
        </main>
    );
};

export default ChatWindow;