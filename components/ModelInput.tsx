import React from 'react';
import { Provider } from '../types';

interface ModelInputProps {
    model: string;
    setModel: (model: string) => void;
    provider: Provider;
}

// Model lists for selection
const providerModels: Record<string, string[]> = {
    [Provider.Gemini]: [
        'gemini-2.5-flash',
    ],
    [Provider.HuggingFace]: [
        'mistralai/Mistral-7B-Instruct-v0.2',
        'meta-llama/Llama-2-7b-chat-hf',
        'google/gemma-7b-it',
        'HuggingFaceH4/zephyr-7b-beta'
    ],
    [Provider.TogetherAI]: [
        'mistralai/Mixtral-8x7B-Instruct-v0.1',
        'meta-llama/Llama-2-70b-chat-hf',
        'Snowflake/snowflake-arctic-instruct',
        'togethercomputer/RedPajama-INCITE-7B-Instruct'
    ],
};


const ModelInput: React.FC<ModelInputProps> = ({ model, setModel, provider }) => {
    // Make a copy to avoid mutating the original object
    const modelsForProvider = [...(providerModels[provider] || [])];

    // Ensure the current model is in the list, if not, add it to the top.
    // This handles cases where a model was saved in localStorage but isn't in our default list.
    if (model && !modelsForProvider.includes(model)) {
        modelsForProvider.unshift(model);
    }
    
    return (
        <div className="relative">
            <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="appearance-none bg-gray-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-8 py-2 cursor-pointer"
                aria-label={`${provider} model selection`}
            >
                {modelsForProvider.map(m => (
                    <option key={m} value={m}>
                        {m}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    );
};

export default ModelInput;