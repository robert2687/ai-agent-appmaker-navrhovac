import React from 'react';
import { Agent } from '../types';
import BotIcon from './icons/BotIcon';
import ArchitectureIcon from './icons/ArchitectureIcon';
import BehaviorIcon from './icons/BehaviorIcon';
import DigitalTwinIcon from './icons/DigitalTwinIcon';
import ApiIcon from './icons/ApiIcon';
import ContentCreatorIcon from './icons/ContentCreatorIcon';
import SummarizerIcon from './icons/SummarizerIcon';
import AppPreviewerIcon from './icons/AppPreviewerIcon';
import CodeCanvasIcon from './icons/CodeCanvasIcon';

/**
 * @interface AgentIconProps
 * @description Props for the AgentIcon component.
 */
interface AgentIconProps {
    /** The agent for which to display an icon. If undefined, the default icon is shown. */
    agent?: Agent;
}

/**
 * A component that displays an icon corresponding to a specific AI agent.
 *
 * @param {AgentIconProps} props The props for the component.
 * @returns {React.ReactElement} The icon component for the specified agent.
 */
const AgentIcon: React.FC<AgentIconProps> = ({ agent }) => {
    switch (agent) {
        case Agent.SystemsArchitect:
            return <ArchitectureIcon />;
        case Agent.BehavioralModeler:
            return <BehaviorIcon />;
        case Agent.DigitalTwin:
            return <DigitalTwinIcon />;
        case Agent.ApiIntegration:
            return <ApiIcon />;
        case Agent.ContentCreator:
            return <ContentCreatorIcon />;
        case Agent.Summarizer:
            return <SummarizerIcon />;
        case Agent.AppPreviewer:
            return <AppPreviewerIcon />;
        case Agent.CodeCanvas:
            return <CodeCanvasIcon />;
        case Agent.Default:
        default:
            return <BotIcon />;
    }
};

export default AgentIcon;