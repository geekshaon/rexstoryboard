import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  elementId: string;
  elementType: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ElementErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[VSSS Element Render Error in ${this.props.elementType}:${this.props.elementId}]:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[100px] flex flex-col items-center justify-center p-3 rounded-xl bg-red-950/40 border-2 border-dashed border-red-500/50 text-red-200 text-center select-none overflow-hidden">
          <AlertTriangle className="w-5 h-5 text-red-400 mb-1 animate-pulse" />
          <span className="text-xs font-bold text-red-300">
            Render Error: {this.props.elementType}
          </span>
          <p className="text-[10px] text-red-400/80 font-mono mt-0.5 max-w-[200px] truncate">
            {this.state.error?.message || 'Element failed to render'}
          </p>
          <button
            onClick={this.handleRetry}
            className="mt-2 px-2 py-0.5 rounded bg-red-900/80 hover:bg-red-800 text-[10px] text-red-100 flex items-center gap-1 border border-red-500/40 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Retry</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

