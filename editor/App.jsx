'use strict';

import React              from 'react';
import { useAppState }    from './store/appState.jsx';
import Topbar             from './components/Topbar.jsx';

// ----------------------------------------------------------
// App — top level layout
// Sidebar, Main are placeholders until their phases
// ----------------------------------------------------------
export default function App() {
    console.trace('[App] begins');

    const { state } = useAppState();

    console.debug('[App] currentView =>', state.currentView);
    console.debug('[App] activeProject =>', state.activeProject);
    console.debug('[App] sidebarCollapsed =>', state.sidebarCollapsed);

    console.trace('[App] ends');

    return (
        <div id="app-shell" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

            {/* Topbar — Phase 2 */}
            <Topbar />

            {/* Body row */}
            <div id="body-row">

                {/* Sidebar — placeholder until Phase 3 */}
                <div id="sidebar" className={state.sidebarCollapsed ? 'collapsed' : ''}>
                    <div style={{ padding: '12px', fontSize: '11px', color: '#555' }}>
                        sidebar — phase 3
                    </div>
                </div>

                {/* Main — placeholder until Phase 4 */}
                <div id="main">
                    <div id="empty-state" className="visible">
                        open or create a project to get started
                    </div>
                </div>

            </div>

        </div>
    );
}
