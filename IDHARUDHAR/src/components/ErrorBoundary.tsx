import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Store, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Campus Market ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      window.localStorage?.clear();
    } catch {
      // Ignore
    }
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0A0A] flex items-center justify-center p-4 text-slate-900 dark:text-slate-100">
          <div className="max-w-md w-full bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The campus feed encountered an unexpected issue. You can safely reload the page.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Campus Marketplace</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
