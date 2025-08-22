import React from 'react';
import { Agent } from '../types';

interface AgentSelectorProps {
    activeAgent: Agent;
    onAgentChange: (agent: Agent) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ activeAgent, onAgentChange }) => {
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onAgentChange(e.target.value as Agent);
    };

    return (
        <div className="relative">
            <select
                value={activeAgent}
                onChange={handleSelectChange}
                className="appearance-none bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-8 py-2 cursor-pointer"
                aria-label="Select AI Agent"
            >
                {Object.values(Agent).map(agent => (
                    <option key={agent} value={agent}>
                        {agent}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    );
};

export default AgentSelector;
