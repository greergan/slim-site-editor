'use strict';

import React                from 'react';
import { createRoot }       from 'react-dom/client';
import { AppStateProvider } from './store/appState.jsx';
import App                  from './App.jsx';
import './css/editor.css';

// ----------------------------------------------------------
// Mount React root
// ----------------------------------------------------------
const container = document.getElementById('root');

if (!container) {
    console.error('[main] #root element not found');
} else {
    console.debug('[main] mounting React root');

    const root = createRoot(container);

    root.render(
        <AppStateProvider>
            <App />
        </AppStateProvider>
    );

    console.debug('[main] React root mounted');
}
