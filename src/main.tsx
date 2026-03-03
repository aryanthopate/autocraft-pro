import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppErrorBoundary } from "@/components/error/AppErrorBoundary";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </AppErrorBoundary>
);
