import React, { useState, useRef, useEffect } from 'react';
import { Agent } from '../types';
import AgentIcon from './AgentIcon';

interface AgentSelectorProps {
    activeAgent: Agent;
    onAgentChange: (agent: Agent) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ activeAgent, onAgentChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelect = (agent: Agent) => {
        onAgentChange(agent);
        setIsOpen(false);
    };

    return (
        <div className="relative w-48" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none pl-3 pr-4 py-2 cursor-pointer text-left"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Select AI Agent"
            >
                <AgentIcon agent={activeAgent} />
                <span className="flex-1 truncate">{activeAgent}</span>
                <svg
                    className={`w-4 h-4 text-slate-400 transition-transform transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            {isOpen && (
                <ul
                    className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    role="listbox"
                >
                    {Object.values(Agent).map(agent => (
                        <li
                            key={agent}
                            onClick={() => handleSelect(agent)}
                            className={`flex items-center gap-3 p-2 text-sm cursor-pointer transition-colors ${
                                activeAgent === agent
                                    ? 'bg-blue-600/50 text-white'
                                    : 'text-slate-200 hover:bg-slate-700'
                            }`}
                            role="option"
                            aria-selected={activeAgent === agent}
                        >
                            <AgentIcon agent={agent} />
                            <span>{agent}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AgentSelector;
