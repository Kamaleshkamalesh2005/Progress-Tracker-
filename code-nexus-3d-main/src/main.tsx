import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Add error handling for the root
try {
  console.log('🚀 Starting Progress Tracker Application...');
  
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
  
  console.log('✅ Application rendered successfully');
} catch (error) {
  console.error('❌ Failed to start application:', error);
  
  // Show error message in the DOM
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #0a0a0a;
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        padding: 2rem;
      ">
        <div>
          <h1 style="color: #ef4444; margin-bottom: 1rem;">Application Error</h1>
          <p style="margin-bottom: 1rem;">Failed to start the application. Please check the console for details.</p>
          <button onclick="window.location.reload()" style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            cursor: pointer;
          ">Reload Page</button>
          <details style="margin-top: 1rem; text-align: left;">
            <summary style="cursor: pointer;">Error Details</summary>
            <pre style="
              background: #1f2937;
              padding: 1rem;
              border-radius: 0.375rem;
              margin-top: 0.5rem;
              overflow: auto;
              font-size: 0.875rem;
            ">${error}</pre>
          </details>
        </div>
      </div>
    `;
  }
}
