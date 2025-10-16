import React from 'react';
import AgentIcon from './AgentIcon';
import { Agent } from '../types';

/**
 * @interface TypingIndicatorProps
 * @description Props for the TypingIndicator component.
 */
interface TypingIndicatorProps {
    /** The agent that is "typing", used to display the correct icon. */
    agent: Agent;
}

/**
 * A component that displays a typing animation to indicate that the AI is generating a response.
 * It consists of the agent's icon followed by three bouncing dots.
 *
 * @param {TypingIndicatorProps} props The props for the component.
 * @returns {React.ReactElement} The rendered typing indicator.
 */
const TypingIndicator: React.FC<TypingIndicatorProps> = ({ agent }) => {
    return (
        <div className="flex items-start gap-3 my-4 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mt-1">
                <AgentIcon agent={agent} />
            </div>
            <div className="max-w-xl rounded-2xl px-5 py-3 shadow-lg bg-gray-700 rounded-bl-lg flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    );
};

export default TypingIndicator;