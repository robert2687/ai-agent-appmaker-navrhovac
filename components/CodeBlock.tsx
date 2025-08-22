import React, { useState } from 'react';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';

const CodeBlock: React.FC<any> = ({ node, ...props }) => {
    const [isCopied, setIsCopied] = useState(false);
    
    // Extract code string and language from the markdown node
    const codeNode = node?.children?.[0];
    const codeString = codeNode?.children?.[0]?.value ?? '';
    const language = codeNode?.properties?.className?.[0]?.replace('language-', '') || 'shell';

    const handleCopy = () => {
        if (codeString) {
            navigator.clipboard.writeText(codeString);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };
    
    return (
        <div className="my-4 rounded-lg bg-slate-900/70 relative font-sans">
            <div className="flex items-center justify-between bg-slate-800 px-4 py-1.5 rounded-t-lg">
                <span className="text-xs text-slate-400">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label="Copy code"
                >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre {...props} className="p-4 overflow-x-auto text-sm" />
        </div>
    );
};

export default CodeBlock;