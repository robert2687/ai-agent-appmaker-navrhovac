import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Message as MessageType, Role, Agent } from '../types';
import UserIcon from './icons/UserIcon';
import ErrorIcon from './icons/ErrorIcon';
import AgentIcon from './AgentIcon';
import CodeBlock from './CodeBlock';
import DownloadIcon from './icons/DownloadIcon';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';


/**
 * @interface MessageProps
 * @description Props for the Message component.
 */
interface MessageProps {
    /** The message object to display. */
    message: MessageType;
}

/**
 * A component that renders a single chat message.
 * It handles different message roles (user, model, error), content types (text, images),
 * and provides actions like copying and downloading message content.
 *
 * @param {MessageProps} props The props for the component.
 * @returns {React.ReactElement} The rendered message bubble.
 */
const Message: React.FC<MessageProps> = ({ message }) => {
    const [isCopied, setIsCopied] = useState(false);
    const isUser = message.role === Role.USER;
    const isError = message.role === Role.ERROR;
    const hasImages = message.imageUrls && message.imageUrls.length > 0;
    const isAppPreview = message.agent === Agent.AppPreviewer;

    const wrapperClasses = `flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`;
    
    const bubbleClasses = `relative group max-w-xl lg:max-w-2xl xl:max-w-3xl rounded-2xl shadow-lg ${
        isUser
            ? 'bg-blue-600 text-white rounded-br-lg'
            : isError
            ? 'bg-red-800 text-red-100 rounded-bl-lg'
            : 'bg-gray-700 text-slate-200 rounded-bl-lg'
    } ${hasImages ? 'p-2 bg-gray-800/50' : 'px-5 py-3'}`;
    
    const icon = isUser ? <UserIcon /> : isError ? <ErrorIcon /> : <AgentIcon agent={message.agent} />;

    const handleCopy = () => {
        if (message.content) {
            navigator.clipboard.writeText(message.content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (!message.content) return;

        if (isAppPreview) {
            // Extract content from markdown code block for HTML files
            const match = /```(html|htmlx|xml)?\s*([\s\S]+?)\s*```/.exec(message.content);
            const htmlContent = match ? match[2] : message.content;
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `app-preview-${new Date().toISOString().split('T')[0]}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            // Default to markdown download for other agents
            const blob = new Blob([message.content], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gemini-response-${new Date().toISOString().split('T')[0]}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className={wrapperClasses}>
            {!isUser && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mt-1">{icon}</div>}
            <div className={bubbleClasses}>
                {!isUser && !hasImages && message.content && (
                     <div className="absolute top-1 right-1 z-10 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={handleDownload}
                            className="p-1.5 rounded-full text-slate-400 hover:bg-gray-600 hover:text-slate-100 transition-colors"
                            aria-label="Download message"
                            title="Download"
                        >
                            <DownloadIcon />
                        </button>
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-full text-slate-400 hover:bg-gray-600 hover:text-slate-100 transition-colors"
                            aria-label="Copy message"
                            title={isCopied ? "Copied!" : "Copy"}
                        >
                            {isCopied ? <CheckIcon /> : <CopyIcon />}
                        </button>
                    </div>
                )}
                {hasImages ? (
                    <div className={`grid gap-2 ${message.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {message.imageUrls.map((url, index) => (
                             <a href={url} target="_blank" rel="noopener noreferrer" key={index} className="block rounded-lg overflow-hidden">
                                <img 
                                    src={url} 
                                    alt={`AI generated image ${index + 1}`} 
                                    className="w-full h-full object-cover aspect-square transition-transform duration-300 hover:scale-105"
                                    aria-label={`AI generated image ${index + 1}`}
                                />
                            </a>
                        ))}
                    </div>
                ) : (
                     <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                                pre: (props) => <CodeBlock {...props} />
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
            {isUser && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center mt-1">{icon}</div>}
        </div>
    );
};

export default Message;