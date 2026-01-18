import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
        if (this.props.fallback) {
            return this.props.fallback;
        }

      return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#1a1a1a',
            color: '#ff6b6b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'monospace',
            zIndex: 10000
        }}>
          <h1>Something went wrong.</h1>
          <p>The application encountered a critical error.</p>
          <pre style={{
              background: '#333',
              padding: '10px',
              borderRadius: '4px',
              maxWidth: '80%',
              overflow: 'auto'
          }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#fff',
                color: '#1a1a1a',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
