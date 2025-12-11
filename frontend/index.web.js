import { registerRootComponent } from 'expo';
import App from './App';

// Import web-specific styles
if (typeof document !== 'undefined') {
    // Inject web styles
    const style = document.createElement('style');
    style.textContent = `
    * {
      box-sizing: border-box;
    }
    
    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
    }
    
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
    
    *:focus-visible {
      outline: 2px solid #6200ee;
      outline-offset: 2px;
    }
  `;
    document.head.appendChild(style);

    // Update document title
    document.title = 'Expense Manager';

    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1, shrink-to-fit=no';
        document.head.appendChild(meta);
    }
}

registerRootComponent(App);
