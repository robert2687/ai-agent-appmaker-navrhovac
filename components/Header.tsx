
import React from 'react';
import { Agent, Provider } from '../types';
import AgentSelector from './AgentSelector';
import HistoryIcon from './icons/HistoryIcon';
import ProviderSelector from './ProviderSelector';
import ModelInput from './ModelInput';
import DownloadIcon from './icons/DownloadIcon';

/**
 * @interface HeaderProps
 * @description Props for the Header component.
 */
interface HeaderProps {
    /** The currently active AI agent. */
    activeAgent: Agent;
    /** Callback function for when the agent is changed. */
    onAgentChange: (agent: Agent) => void;
    /** Callback function to toggle the visibility of the history sidebar. */
    onToggleSidebar: () => void;
    /** The currently active AI provider. */
    activeProvider: Provider;
    /** Callback function for when the provider is changed. */
    onProviderChange: (provider: Provider) => void;
    /** A record of the currently selected model for each provider. */
    modelState: Record<string, string>;
    /** Callback function for when a provider's model is changed. */
    onModelChange: (provider: Provider, model: string) => void;
    /** Callback function to trigger the export of the current chat. */
    onExportChat: () => void;
}

/**
 * The main header component for the application.
 * It contains controls for toggling the sidebar, selecting the AI provider and agent,
 * changing the model, and exporting the chat.
 *
 * @param {HeaderProps} props The props for the component.
 * @returns {React.ReactElement} The rendered header.
 */
const Header: React.FC<HeaderProps> = ({ 
    activeAgent, 
    onAgentChange, 
    onToggleSidebar,
    activeProvider,
    onProviderChange,
    modelState,
    onModelChange,
    onExportChat,
}) => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 shadow-md z-10 flex-shrink-0">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                 <div className="flex items-center gap-2">
                     <button
                        onClick={onToggleSidebar}
                        className="p-2 rounded-full text-slate-400 hover:bg-gray-700 hover:text-slate-100 transition-colors"
                        aria-label="Toggle History"
                        title="Toggle History"
                    >
                        <HistoryIcon />
                    </button>
                    <h1 className="text-xl font-bold text-slate-100 hidden sm:block">AI Agent System</h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <button
                        onClick={onExportChat}
                        className="p-2 rounded-full text-slate-400 hover:bg-gray-700 hover:text-slate-100 transition-colors"
                        aria-label="Export Chat"
                        title="Export Chat"
                    >
                        <DownloadIcon />
                    </button>
                    <ProviderSelector activeProvider={activeProvider} onProviderChange={onProviderChange} />
                    {activeProvider === Provider.Gemini ? (
                        <>
                            <AgentSelector activeAgent={activeAgent} onAgentChange={onAgentChange} />
                            <ModelInput 
                                provider={Provider.Gemini}
                                model={modelState[Provider.Gemini] || ''}
                                setModel={(newModel) => onModelChange(Provider.Gemini, newModel)}
                            />
                        </>
                    ) : (
                       <ModelInput 
                         provider={activeProvider}
                         model={modelState[activeProvider] || ''}
                         setModel={(newModel) => onModelChange(activeProvider, newModel)}
                       />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;