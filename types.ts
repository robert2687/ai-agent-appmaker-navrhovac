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