'use strict';

import React              from 'react';
import { useAppState }    from './store/appState.jsx';

// ----------------------------------------------------------
// App — top level layout
// Topbar, Sidebar, Main are placeholders until their phases
// ----------------------------------------------------------
export default function App() {
    console.trace('[App] begins');

    const { state } = useAppState();

    console.debug('[App] currentView =>', state.currentView);
    console.debug('[App] activeProject =>', state.activeProject);

    console.trace('[App] ends');

    return (
        <div id="app-shell" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

            {/* Topbar — placeholder until Phase 2 */}
            <div id="topbar">
                <button id="menu-toggle">&#9776;</button>
                <span
                    id="status"
                    className={state.statusMsg.state}
                >
                    {state.statusMsg.msg}
                </span>
            </div>

            {/* Body row */}
            <div id="body-row">

                {/* Sidebar — placeholder until Phase 3 */}
                <div id="sidebar">
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
