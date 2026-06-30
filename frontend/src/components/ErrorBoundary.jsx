import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-red-900 rounded-full blur-3xl opacity-5"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-5"></div>

          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6 relative z-10 animate-in fade-in duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-600 rounded-2xl">
              <AlertTriangle size={36} strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Something went wrong</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                An unexpected interface rendering issue occurred. You can reload the application to try again.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 rounded-lg text-left border border-slate-100 overflow-x-auto max-h-32 text-[11px] font-mono text-red-600">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold rounded-lg shadow-md transition-all cursor-pointer"
            >
              <RotateCcw size={16} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
