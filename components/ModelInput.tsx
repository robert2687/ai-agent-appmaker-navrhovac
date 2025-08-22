import React from 'react';
import { Provider } from '../types';

interface ModelInputProps {
    model: string;
    setModel: (model: string) => void;
    provider: Provider;
}

const ModelInput: React.FC<ModelInputProps> = ({ model, setModel, provider }) => {
    return (
        <div className="relative">
            <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={`Enter ${provider} model`}
                className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-2 py-2"
                aria-label={`${provider} model name`}
            />
        </div>
    );
};

export default ModelInput;
