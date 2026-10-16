import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`p-4 rounded-xl bg-red-50/80 border border-red-200 text-red-800 flex items-start space-x-3 shadow-xs ${className}`}>
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center text-xs font-semibold text-red-700 hover:text-red-800 underline underline-offset-2 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
