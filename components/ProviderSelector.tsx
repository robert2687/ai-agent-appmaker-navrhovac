import React from 'react';
import { Provider } from '../types';

interface ProviderSelectorProps {
    activeProvider: Provider;
    onProviderChange: (provider: Provider) => void;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ activeProvider, onProviderChange }) => {
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onProviderChange(e.target.value as Provider);
    };

    return (
        <div className="relative">
            <select
                value={activeProvider}
                onChange={handleSelectChange}
                className="appearance-none bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-8 py-2 cursor-pointer"
                aria-label="Select AI Provider"
            >
                {Object.values(Provider).map(provider => (
                    <option key={provider} value={provider}>
                        {provider}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    );
};

export default ProviderSelector;
