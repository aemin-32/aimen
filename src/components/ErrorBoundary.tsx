
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 max-w-md w-full backdrop-blur-sm animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight mb-2">System Failure</h1>
            <p className="text-sm text-gray-400 mb-6 font-mono">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={16} /> Reboot System
            </button>
          </div>
          <p className="mt-8 text-[10px] text-gray-600 font-mono uppercase">
            LifeOS Kernel Panic • v0.0.1
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
