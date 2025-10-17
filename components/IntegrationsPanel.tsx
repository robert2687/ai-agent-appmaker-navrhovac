import React, { useEffect, useMemo, useState } from 'react';
import { Provider, Integration } from '../types';

interface IntegrationsPanelProps {
  open: boolean;
  integrations: Integration[];
  onClose: () => void;
  onSave: (items: Integration[]) => void;
}

const predefinedByProvider: Record<Provider, { id: string; name: string } > = {
  [Provider.Gemini]: { id: 'gemini', name: 'Google Gemini' },
  [Provider.HuggingFace]: { id: 'huggingface', name: 'Hugging Face' },
  [Provider.TogetherAI]: { id: 'togetherai', name: 'Together.AI' },
};

const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({ open, integrations, onClose, onSave }) => {
  const [items, setItems] = useState<Integration[]>(integrations);

  useEffect(() => {
    if (open) setItems(integrations);
  }, [open, integrations]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const addEmpty = () => {
    setItems(prev => [
      ...prev,
      { id: `custom-${Date.now()}`, name: '', apiKey: '', enabled: true },
    ]);
  };

  const addPredefined = (provider: Provider) => {
    const meta = predefinedByProvider[provider];
    setItems(prev => [
      ...prev,
      { id: meta.id, name: meta.name, provider, enabled: true, apiKey: '' },
    ]);
  };

  const updateItem = (id: string, patch: Partial<Integration>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSave = () => onSave(items);

  const hasPredefined = useMemo(() => {
    const set = new Set(items.map(i => i.provider));
    return (prov: Provider) => set.has(prov);
  }, [items]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        className="relative w-full md:max-w-2xl bg-gray-800 border border-gray-700 rounded-t-2xl md:rounded-2xl shadow-xl p-4 md:p-6 transform transition-all duration-200 ease-out translate-y-0 md:translate-y-0"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Integrations</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-gray-700"
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {items.length === 0 && (
            <div className="text-sm text-slate-300 bg-gray-700/40 border border-gray-700 rounded-md p-4">
              No integrations configured yet. Add one below.
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-gray-700 bg-gray-900/40 p-3">
              <div className="flex items-center gap-2 mb-2">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  placeholder="Integration name"
                  className="flex-1 bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <label className="flex items-center gap-2 text-slate-300 text-sm">
                  <input
                    type="checkbox"
                    checked={!!item.enabled}
                    onChange={(e) => updateItem(item.id, { enabled: e.target.checked })}
                  />
                  Enabled
                </label>
                <button
                  onClick={() => removeItem(item.id)}
                  className="px-2 py-1 text-sm rounded-md bg-red-600/80 hover:bg-red-600 text-white"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  value={item.apiKey || ''}
                  onChange={(e) => updateItem(item.id, { apiKey: e.target.value })}
                  placeholder="API key"
                  className="bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  value={item.baseUrl || ''}
                  onChange={(e) => updateItem(item.id, { baseUrl: e.target.value })}
                  placeholder="Base URL (optional)"
                  className="bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {item.provider && (
                <div className="mt-2 text-xs text-slate-400">Linked to provider: {item.provider}</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {!hasPredefined(Provider.Gemini) && (
              <button onClick={() => addPredefined(Provider.Gemini)} className="px-3 py-2 rounded-md bg-indigo-600/90 hover:bg-indigo-600 text-white text-sm">Add Gemini</button>
            )}
            {!hasPredefined(Provider.HuggingFace) && (
              <button onClick={() => addPredefined(Provider.HuggingFace)} className="px-3 py-2 rounded-md bg-indigo-600/90 hover:bg-indigo-600 text-white text-sm">Add Hugging Face</button>
            )}
            {!hasPredefined(Provider.TogetherAI) && (
              <button onClick={() => addPredefined(Provider.TogetherAI)} className="px-3 py-2 rounded-md bg-indigo-600/90 hover:bg-indigo-600 text-white text-sm">Add Together.AI</button>
            )}
            <button onClick={addEmpty} className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-sm">Add Custom</button>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white text-sm">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-md bg-emerald-600/90 hover:bg-emerald-600 text-white text-sm">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPanel;
