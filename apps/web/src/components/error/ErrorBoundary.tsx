import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

const ErrorFallback = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section
        className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-sm"
        role="alert"
      >
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-500/10 text-red-600">
          <AlertTriangle aria-hidden="true" className="size-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          We could not display this page. Please try again to continue.
        </p>
        <Button className="mt-6" onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
      </section>
    </main>
  );
};

/**
 * React exposes render error recovery through class component lifecycle APIs.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? <ErrorFallback onRetry={this.handleRetry} />
      );
    }

    return this.props.children;
  }
}
