
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface GlobalErrorBoundaryProps {
  children?: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
}

// Fix: Use explicit Component types to resolve 'props' and 'state' property errors in class context
class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  // Fix: Explicitly declare props and state as class properties to avoid TS missing property errors
  props: GlobalErrorBoundaryProps;
  state: GlobalErrorBoundaryState = { hasError: false };

  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(): GlobalErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("StyleFit Crash Log:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', direction: 'rtl', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#8A42F4' }}>عذراً، حدث خطأ مفاجئ</h2>
          <p style={{ color: '#666' }}>يرجى إعادة تشغيل التطبيق لتصحيح المسار.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#8A42F4', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              marginTop: '20px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </React.StrictMode>
  );
}
