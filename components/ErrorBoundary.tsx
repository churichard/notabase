import { Component, ReactNode } from 'react';

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

  render() {
    const { children, fallback } = this.props;

    if (this.state.hasError) {
      return (
        fallback ?? (
          <div className="flex items-center justify-center flex-shrink-0 w-full h-full">
            <p>An unexpected error occurred.</p>
          </div>
        )
      );
    }

    return children;
  }
}
