import { AlertCircle, WifiOff, Clock, XCircle, Info } from "lucide-react";
import { getErrorInfo, ErrorInfo } from "@/react-app/utils/errorMessages";

interface ErrorDisplayProps {
  error: string | Error;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function ErrorDisplay({ error, onRetry, isRetrying }: ErrorDisplayProps) {
  const errorInfo: ErrorInfo = getErrorInfo(error);

  // Choose icon based on error type
  const getIcon = () => {
    if (errorInfo.title.includes('conexión') || errorInfo.title.includes('red')) {
      return <WifiOff className="w-5 h-5 flex-shrink-0 mt-0.5" />;
    }
    if (errorInfo.title.includes('tiempo') || errorInfo.title.includes('Tiempo')) {
      return <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" />;
    }
    if (errorInfo.title.includes('incorrecto') || errorInfo.title.includes('inválido')) {
      return <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />;
    }
    if (errorInfo.title.includes('información') || errorInfo.title.includes('ayuda')) {
      return <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />;
    }
    return <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />;
  };

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="text-red-600">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-red-900 mb-1">
            {errorInfo.title}
          </h3>
          <p className="text-sm text-red-700 mb-1">
            {errorInfo.message}
          </p>
          <p className="text-xs text-red-600">
            💡 {errorInfo.suggestion}
          </p>
        </div>
      </div>

      {/* Retry button if error is retryable and callback is provided */}
      {errorInfo.retryable && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full mt-4 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isRetrying ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Reintentando...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reintentar</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
