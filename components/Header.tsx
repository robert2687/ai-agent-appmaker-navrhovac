
import React from 'react';
import { Agent, Provider } from '../types';
import AgentSelector from './AgentSelector';
import HistoryIcon from './icons/HistoryIcon';
import ProviderSelector from './ProviderSelector';
import ModelInput from './ModelInput';
import DownloadIcon from './icons/DownloadIcon';
import SettingsIcon from './icons/SettingsIcon';

interface HeaderProps {
    activeAgent: Agent;
    onAgentChange: (agent: Agent) => void;
    onToggleSidebar: () => void;
    activeProvider: Provider;
    onProviderChange: (provider: Provider) => void;
    modelState: Record<string, string>;
    onModelChange: (provider: Provider, model: string) => void;
    onExportChat: () => void;
    onOpenIntegrations?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    activeAgent, 
    onAgentChange, 
    onToggleSidebar,
    activeProvider,
    onProviderChange,
    modelState,
    onModelChange,
    onExportChat,
    onOpenIntegrations,
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
                    <button
                        onClick={onOpenIntegrations}
                        className="p-2 rounded-full text-slate-400 hover:bg-gray-700 hover:text-slate-100 transition-colors"
                        aria-label="Integrations"
                        title="Integrations / Settings"
                    >
                        <SettingsIcon />
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
