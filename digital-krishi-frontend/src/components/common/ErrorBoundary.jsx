import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.warn('Component error caught by boundary:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onRetry === 'function') {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error, this.handleRetry)
          : this.props.fallback;
      }

      const widgetTitle = this.props.title || 'Service';

      return (
        <div
          style={{
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            minHeight: this.props.isWidget ? '160px' : '260px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}
          >
            <FaExclamationTriangle />
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#92400e' }}>
              {widgetTitle} Temporarily Unavailable
            </h4>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#b45309', maxWidth: '380px' }}>
              {this.props.message || 'We are unable to load this section right now. The rest of the dashboard remains fully active.'}
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            style={{
              marginTop: '4px',
              background: '#d97706',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s ease'
            }}
          >
            <FaRedo /> Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
