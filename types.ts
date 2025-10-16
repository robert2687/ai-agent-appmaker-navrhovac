export enum Provider {
    Gemini = 'Gemini',
    HuggingFace = 'Hugging Face',
    TogetherAI = 'Together.AI',
}

export enum Role {
    USER = 'user',
    MODEL = 'model',
    ERROR = 'error',
}

export enum Agent {
    Default = 'Default',
    SystemsArchitect = 'Systems Architect',
    BehavioralModeler = 'Behavioral Modeler',
    DigitalTwin = 'Digital Twin',
    ApiIntegration = 'API Integration',
    ContentCreator = 'Content Creator',
    Summarizer = 'Summarizer',
    AppPreviewer = 'App Previewer',
    CodeCanvas = 'Code Canvas',
}

export interface Message {
    role: Role;
    content: string;
    imageUrls?: string[];
    agent?: Agent;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
}

// ===== Integrations =====
export enum IntegrationCategory {
    Communication = 'Communication',
    Development = 'Development',
    Design = 'Design',
    Support = 'Support',
    AIAgents = 'AI Agents',
}

export interface IntegrationCredentialField {
    key: string; // key used in credentials object
    label: string;
    type?: 'text' | 'password' | 'token' | 'url';
    required?: boolean;
    placeholder?: string;
    help?: string;
}

export interface IntegrationDefinition {
    id: string;
    name: string;
    description: string;
    category: IntegrationCategory;
    fields: IntegrationCredentialField[];
    badge?: string; // optional badge/tag text
}

export interface IntegrationConfig {
    id: string;
    enabled: boolean;
    credentials: Record<string, string>; // decrypted in-memory
    lastTestedAt?: number;
    lastTestResult?: 'connected' | 'failed';
}
