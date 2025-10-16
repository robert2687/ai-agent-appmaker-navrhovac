
import React from 'react';
import ErrorIcon from './icons/ErrorIcon';

/**
 * @interface ErrorDisplayProps
 * @description Props for the ErrorDisplay component.
 */
interface ErrorDisplayProps {
    /** The error message to display. */
    message: string;
}

/**
 * A component that displays an error message in a noticeable banner format.
 * It only renders if a message is provided.
 *
 * @param {ErrorDisplayProps} props The props for the component.
 * @returns {React.ReactElement | null} The rendered error display or null if there is no message.
 */
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
