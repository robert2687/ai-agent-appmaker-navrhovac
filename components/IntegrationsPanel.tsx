import React, { useMemo, useState } from 'react';
import IntegrationSettings from './IntegrationSettings';
import { IntegrationCategory, IntegrationConfig, IntegrationDefinition } from '../types';

interface IntegrationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  configs: Record<string, IntegrationConfig>;
  onChange: (next: Record<string, IntegrationConfig>) => void;
}

export const INTEGRATIONS_STORAGE_KEY = 'integrations-config-v1';

const DEFAULT_DEFINITIONS: IntegrationDefinition[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications to Slack channels via incoming webhooks.',
    category: IntegrationCategory.Communication,
    fields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true, placeholder: 'https://hooks.slack.com/services/…' },
    ],
    badge: 'Webhook',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect GitHub using a Personal Access Token to let agents reference repos or create issues.',
    category: IntegrationCategory.Development,
    fields: [
      { key: 'token', label: 'Personal Access Token', type: 'token', required: true, placeholder: 'ghp_… or github_pat_…' },
    ],
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Use a GitLab access token for repository operations and issues.',
    category: IntegrationCategory.Development,
    fields: [
      { key: 'token', label: 'Access Token', type: 'token', required: true },
    ],
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Read files and comments via the Figma API with a token.',
    category: IntegrationCategory.Design,
    fields: [
      { key: 'token', label: 'API Token', type: 'token', required: true },
    ],
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Create and track issues using the Linear API.',
    category: IntegrationCategory.Development,
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'token', required: true, placeholder: 'lin_…' },
    ],
  },
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Support conversations and users via Intercom API.',
    category: IntegrationCategory.Support,
    fields: [
      { key: 'accessToken', label: 'Access Token', type: 'token', required: true },
    ],
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Create tickets and query support data in Zendesk.',
    category: IntegrationCategory.Support,
    fields: [
      { key: 'subdomain', label: 'Subdomain', type: 'text', required: true, placeholder: 'your-company' },
      { key: 'email', label: 'Agent Email', type: 'text', required: true },
      { key: 'apiToken', label: 'API Token', type: 'token', required: true },
    ],
  },
  {
    id: 'webhook',
    name: 'Custom Webhook',
    description: 'Post data to any URL. Useful for simple automations or connecting custom services.',
    category: IntegrationCategory.AIAgents,
    fields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'url', required: true },
      { key: 'secret', label: 'Shared Secret (optional)', type: 'password', required: false },
    ],
    badge: 'Custom',
  },
];

const categories: (IntegrationCategory | 'All')[] = ['All', ...Object.values(IntegrationCategory)];

function ConnectedDot({ connected }: { connected: boolean }) {
  return (
    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
  );
}

const IntegrationCard: React.FC<{
  def: IntegrationDefinition;
  config: IntegrationConfig;
  onToggle: (id: string, enabled: boolean) => void;
  onConfigure: () => void;
}> = ({ def, config, onToggle, onConfigure }) => {
  const isConnected = config.lastTestResult === 'connected' || (def.fields.every(f => !f.required || !!config.credentials[f.key]) && config.enabled);
  return (
    <div className="group border border-gray-700 rounded-xl p-4 bg-gray-800/60 hover:bg-gray-800 transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-white font-semibold">
            {def.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{def.name}</h4>
              {def.badge && <span className="text-[10px] uppercase tracking-wider bg-gray-700 text-slate-200 px-1.5 py-0.5 rounded">{def.badge}</span>}
            </div>
            <p className="text-sm text-slate-300 line-clamp-2">{def.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConnectedDot connected={isConnected} />
          <span className="text-xs text-slate-400">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button onClick={onConfigure} className="text-sm px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600">Configure</button>
        <label className="inline-flex items-center cursor-pointer select-none">
          <input type="checkbox" className="sr-only" checked={config.enabled} onChange={(e)=> onToggle(def.id, e.target.checked)} />
          <span className={`w-10 h-6 flex items-center rounded-full p-1 transition ${config.enabled ? 'bg-blue-600' : 'bg-gray-600'}`}>
            <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${config.enabled ? 'translate-x-4' : ''}`}></span>
          </span>
        </label>
      </div>
    </div>
  );
};

const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({ isOpen, onClose, configs, onChange }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory | 'All'>('All');
  const [settingsFor, setSettingsFor] = useState<IntegrationDefinition | null>(null);

  const definitions = DEFAULT_DEFINITIONS; // could be extended from server in future

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return definitions.filter(d => (activeCategory === 'All' || d.category === activeCategory) && (!q || d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)));
  }, [definitions, query, activeCategory]);

  const handleToggle = (id: string, enabled: boolean) => {
    const next = { ...configs, [id]: { ...(configs[id] || { id, credentials: {}, enabled: false }), enabled } };
    onChange(next);
  };

  const handleOpenSettings = (def: IntegrationDefinition) => setSettingsFor(def);
  const handleCloseSettings = () => setSettingsFor(null);

  const handleSaveSettings = (updated: IntegrationConfig) => {
    const next = { ...configs, [updated.id]: updated };
    onChange(next);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <aside className="w-full max-w-3xl bg-gray-900 h-full border-l border-gray-700 shadow-xl overflow-y-auto">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-900/80 backdrop-blur">
          <h2 className="text-lg font-semibold">Connect your tools</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white px-2 py-1">✕</button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={`px-3 py-1.5 text-sm rounded-md border ${activeCategory === cat ? 'bg-blue-600 border-blue-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
              >{cat}</button>
            ))}
          </div>

          <div>
            <input
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder="Search integrations…"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {list.map(def => (
              <IntegrationCard
                key={def.id}
                def={def}
                config={configs[def.id] || { id: def.id, enabled: false, credentials: {} }}
                onToggle={handleToggle}
                onConfigure={() => handleOpenSettings(def)}
              />
            ))}
          </div>
        </div>
      </aside>

      {settingsFor && (
        <IntegrationSettings
          definition={settingsFor}
          value={configs[settingsFor.id] || { id: settingsFor.id, enabled: false, credentials: {} }}
          onSave={handleSaveSettings}
          onClose={handleCloseSettings}
        />
      )}
    </div>
  );
};

export default IntegrationsPanel;
