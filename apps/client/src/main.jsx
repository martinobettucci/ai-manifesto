import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/familjen-grotesk/400.css';
import '@fontsource/familjen-grotesk/500.css';
import '@fontsource/familjen-grotesk/600.css';
import '@fontsource/familjen-grotesk/700.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import BackofficeApp from './BackofficeApp.jsx';
import './i18n.js';
import './styles.css';

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
const RootComponent = normalizedPath === '/backoffice' ? BackofficeApp : App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>,
);
