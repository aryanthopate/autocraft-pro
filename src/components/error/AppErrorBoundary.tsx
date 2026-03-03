import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application crashed:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-racing/15 text-racing">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">We hit an unexpected error</h1>
            <p className="text-muted-foreground mb-6">
              The app recovered safely. Reload to continue.
            </p>
            <Button onClick={this.handleReload} className="bg-gradient-to-r from-racing to-racing-dark text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload app
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
