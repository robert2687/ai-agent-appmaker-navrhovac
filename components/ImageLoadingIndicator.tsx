
import React from 'react';
import BotIcon from './icons/BotIcon';
import ImageIcon from './icons/ImageIcon';

/**
 * A component that displays a loading indicator specifically for image generation.
 * It shows an icon, a "Generating image..." message, and an animated ellipsis.
 *
 * @returns {React.ReactElement} The rendered image loading indicator.
 */
const ImageLoadingIndicator: React.FC = () => {
    return (
        <div className="flex items-start gap-3 my-4 justify-start" aria-label="Generating image">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mt-1">
                <BotIcon />
            </div>
            <div className="max-w-xl rounded-2xl px-5 py-3 shadow-lg bg-gray-700 rounded-bl-lg flex items-center space-x-3">
                <ImageIcon />
                <span className="text-slate-300 text-sm">Generating image...</span>
                 <div className="flex items-center space-x-1.5 ml-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                 </div>
            </div>
        </div>
    );
};

export default ImageLoadingIndicator;