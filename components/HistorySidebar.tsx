import React, { useMemo, useState } from 'react';
import { ChatSession, Agent, Provider, Role } from '../types';
import NewChatIcon from './icons/NewChatIcon';
import TrashIcon from './icons/TrashIcon';
import AgentIcon from './AgentIcon';
import BotIcon from './icons/BotIcon';
import SearchIcon from './icons/SearchIcon';

interface HistorySidebarProps {
    isOpen: boolean;
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewChat: () => void;
    onDeleteSession: (id: string) => void;
    agent: Agent;
    provider: Provider;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
    isOpen,
    sessions,
    activeSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    agent,
    provider,
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation(); // Prevent session selection when deleting
        if (window.confirm('Are you sure you want to delete this chat?')) {
            onDeleteSession(sessionId);
        }
    };

    const filteredSessions = useMemo(() => {
        if (!searchTerm.trim()) {
            return sessions;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return sessions.filter(session => {
            const titleMatch = session.title.toLowerCase().includes(lowercasedTerm);
            if (titleMatch) return true;

            const messageMatch = session.messages.some(message =>
                message.role !== Role.ERROR && message.content.toLowerCase().includes(lowercasedTerm)
            );
            return messageMatch;
        });
    }, [sessions, searchTerm]);


    if (!isOpen) {
        return null;
    }
    
    const TitleIcon = provider === Provider.Gemini ? <AgentIcon agent={agent} /> : <BotIcon />;
    const titleText = provider === Provider.Gemini ? agent : provider;

    return (
        <aside className="w-64 bg-slate-800 flex flex-col p-2 border-r border-slate-700/50">
            <div className="flex items-center justify-between p-2 mb-2">
                <div className="flex items-center gap-2">
                    {TitleIcon}
                    <h2 className="text-lg font-semibold text-slate-200">{titleText}</h2>
                </div>
                <button
                    onClick={onNewChat}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors"
                    aria-label="New Chat"
                    title="New Chat"
                >
                    <NewChatIcon />
                </button>
            </div>
            <div className="relative px-2 mb-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    aria-label="Search past chats"
                />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {filteredSessions.map((session) => (
                    <div
                        key={session.id}
                        onClick={() => onSelectSession(session.id)}
                        className={`group flex items-center justify-between w-full text-left p-2 rounded-md text-sm truncate cursor-pointer transition-colors ${
                            activeSessionId === session.id
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        <span className="truncate">{session.title}</span>
                        <button
                            onClick={(e) => handleDelete(e, session.id)}
                            className="p-1 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-slate-600/50 transition-opacity"
                            aria-label={`Delete chat "${session.title}"`}
                        >
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default HistorySidebar;