import React, { useMemo, useState } from 'react';
import { IntegrationConfig, IntegrationDefinition } from '../types';

interface IntegrationSettingsProps {
  definition: IntegrationDefinition;
  value: IntegrationConfig; // current config (decrypted)
  onSave: (updated: IntegrationConfig) => void;
  onClose: () => void;
}

const STORAGE_WARNING = 'Credentials are stored locally in your browser. For security, use least-privilege keys. These values are weakly obfuscated, not truly encrypted.';

const isValidUrl = (url: string) => {
  try {
    const u = new URL(url);
    return Boolean(u.protocol === 'http:' || u.protocol === 'https:');
  } catch {
    return false;
  }
};

function validate(def: IntegrationDefinition, creds: Record<string,string>): string | null {
  for (const f of def.fields) {
    const v = (creds[f.key] || '').trim();
    if (f.required && !v) return `${f.label} is required.`;
    if (f.type === 'url' && v && !isValidUrl(v)) return `${f.label} must be a valid URL.`;
  }
  if (def.id === 'slack' && creds['webhookUrl']) {
    if (!creds['webhookUrl'].startsWith('https://hooks.slack.com/')) return 'Slack webhook URL must start with https://hooks.slack.com/';
  }
  if (def.id === 'github' && creds['token']) {
    const t = creds['token'];
    if (!(t.startsWith('ghp_') || t.startsWith('github_pat_')) && t.length < 20) return 'GitHub token format looks invalid.';
  }
  if (def.id === 'linear' && creds['apiKey']) {
    const t = creds['apiKey'];
    if (!t.startsWith('lin_')) return 'Linear API key should start with lin_';
  }
  return null;
}

async function mockTestConnection(def: IntegrationDefinition, creds: Record<string,string>): Promise<{ok: boolean; message: string}> {
  const err = validate(def, creds);
  if (err) return { ok: false, message: err };
  await new Promise(r => setTimeout(r, 600));
  const hasAny = Object.values(creds).some(v => !!v);
  return hasAny ? { ok: true, message: `${def.name} looks properly configured.` } : { ok: false, message: 'Missing credentials.' };
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ definition, value, onSave, onClose }) => {
  const initial = useMemo(() => ({ ...value.credentials }), [value.credentials]);
  const [credentials, setCredentials] = useState<Record<string,string>>(initial);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (k: string, v: string) => {
    setCredentials(prev => ({ ...prev, [k]: v }));
  };

  const handleSave = async () => {
    setError(null);
    const err = validate(definition, credentials);
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    try {
      onSave({ ...value, credentials: credentials });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);
    try {
      const result = await mockTestConnection(definition, credentials);
      setTestResult(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Configure {definition.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white px-2 py-1">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-300">{definition.description}</p>
          <div className="rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-3 text-xs">
            {STORAGE_WARNING}
          </div>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            {definition.fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="text-sm block text-slate-200">{f.label}{f.required && <span className="text-red-400"> *</span>}</label>
                <input
                  type={f.type === 'password' || f.type === 'token' ? 'password' : f.type === 'url' ? 'url' : 'text'}
                  value={credentials[f.key] || ''}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {f.help && <p className="text-xs text-slate-400">{f.help}</p>}
              </div>
            ))}
            {error && <div className="text-sm text-red-400">{error}</div>}
            {testResult && <div className="text-sm text-emerald-400">{testResult}</div>}
            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={handleTest} disabled={testing} className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm disabled:opacity-50">
                {testing ? 'Testing…' : 'Test connection'}
              </button>
              <div className="space-x-2">
                <button type="button" onClick={onClose} className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-sm disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettings;
