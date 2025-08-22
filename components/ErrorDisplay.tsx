
import React from 'react';
import ErrorIcon from './icons/ErrorIcon';

interface ErrorDisplayProps {
    message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
    if (!message) return null;

    return (
        <div className="bg-red-900/50 text-red-200 p-3 text-center text-sm flex items-center justify-center gap-2">
            <ErrorIcon />
            <span>{message}</span>
        </div>
    );
};

export default ErrorDisplay;
