import React from 'react';
import { Alert } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="danger">
          Something went wrong. Please refresh the page.
        </Alert>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
