import React from 'react';
import { Agent } from '../types';
import AgentIcon from './AgentIcon';

interface WelcomeScreenProps {
    activeAgent: Agent;
    onPromptClick: (prompt: string) => void;
}

const agentPromptSuggestions: Record<Agent, string[]> = {
    [Agent.Default]: [
        "Explain quantum computing in simple terms",
        "What are some recipes for a healthy breakfast?",
        "Write a short story about a robot who discovers music",
        "/imagine a futuristic city skyline at sunset",
    ],
    [Agent.SystemsArchitect]: [
        "Design an architecture for a real-time chat application",
        "Outline the data model for an e-commerce platform",
        "What technology stack would you recommend for a social media app?",
        "Describe the API design for a weather service",
    ],
    [Agent.BehavioralModeler]: [
        "Create a persona for a cheerful and helpful onboarding assistant",
        "Define the personality traits of a cynical but brilliant detective AI",
        "Describe the communication style of a wise, ancient storyteller",
        "Draft an example dialogue for a sarcastic customer support bot",
    ],
    [Agent.DigitalTwin]: [
        "Model the supply chain for a global logistics company",
        "Create a data schema for a smart home's energy consumption",
        "Outline the simulation logic for traffic flow in a city",
        "Design an interaction API for a virtual power plant model",
    ],
    [Agent.ApiIntegration]: [
        "Write a TypeScript function to fetch user data from a REST API",
        "Show an example of uploading a file to a cloud storage service",
        "How do I securely connect to a service using an OAuth2 token?",
        "Provide a code snippet for handling API rate limiting",
    ],
    [Agent.ContentCreator]: [
        "Write a blog post about the future of artificial intelligence",
        "Draft a marketing email for a new productivity app",
        "Generate a list of 10 catchy headlines for an article on remote work",
        "Create a short script for a promotional video",
    ],
    [Agent.Summarizer]: [
        "Summarize a long news article about climate change",
        "Distill the key points from a scientific research paper",
        "Provide a brief overview of a book's main plot",
        "Condense a lengthy business meeting transcript into bullet points",
    ],
    [Agent.AppPreviewer]: [
        "A simple to-do list application",
        "A weather app that shows the current temperature",
        "A Pomodoro timer with start, stop, and reset buttons",
        "A basic calculator with number and operator buttons",
    ],
    [Agent.CodeCanvas]: [
        "How can I visualize the dependency tree of my React project?",
        "Show me the steps to map out the control flow of a complex function",
        "Guide me through analyzing the component hierarchy in my application",
        "What's the best way to identify potential circular dependencies?",
    ],
};


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ activeAgent, onPromptClick }) => {
    const suggestions = agentPromptSuggestions[activeAgent] || [];

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                <div className="transform scale-150">
                    <AgentIcon agent={activeAgent} />
                </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-200 mb-2">
                {activeAgent}
            </h1>
            <p className="text-slate-400 mb-8 max-w-md">
                Ready to assist. Start the conversation or try one of these prompts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {suggestions.map((prompt, index) => (
                    <button
                        key={index}
                        onClick={() => onPromptClick(prompt)}
                        className="bg-gray-700/50 p-4 rounded-lg text-left text-sm text-slate-300 hover:bg-gray-700 transition-colors"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WelcomeScreen;
