import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    Sentry.captureException(error);
  }

  render() {
    const { children, fallback } = this.props;

    if (this.state.hasError) {
      return (
        fallback ?? (
          <div className="flex h-full w-full flex-1 flex-shrink-0 items-center justify-center">
            <p>An unexpected error occurred.</p>
          </div>
        )
      );
    }

    return children;
  }
}
