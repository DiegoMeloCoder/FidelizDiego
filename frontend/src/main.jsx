import React from 'react'; // Changed from StrictMode
import ReactDOM from 'react-dom/client'; // Changed from createRoot
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx'; // Import AuthProvider with .jsx

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode> {/* Keep StrictMode */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
