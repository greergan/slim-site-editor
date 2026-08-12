'use strict';

import React           from 'react';
import { useAppState } from './store/appState.jsx';
import Topbar          from './components/Topbar.jsx';
import Sidebar         from './components/Sidebar.jsx';

// ----------------------------------------------------------
// App — top level layout
// Main is placeholder until Phase 4
// ----------------------------------------------------------
export default function App() {
    console.trace('[App] begins');

    const { state, dispatch } = useAppState();

    console.debug('[App] currentView =>', state.currentView);
    console.debug('[App] activeProject =>', state.activeProject);
    console.debug('[App] sidebarCollapsed =>', state.sidebarCollapsed);

    // ----------------------------------------------------------
    // Sidebar navigation handlers — passed down to Sidebar
    // Phases 6-9 will wire these to real views
    // ----------------------------------------------------------
    function handleOpenConfig(dir) {
        console.trace('[App:handleOpenConfig] begins');
        console.debug('[App:handleOpenConfig] dir =>', dir);
        // Phase 6
        console.trace('[App:handleOpenConfig] ends');
    }

    function handleOpenPost(dir, slug) {
        console.trace('[App:handleOpenPost] begins');
        console.debug('[App:handleOpenPost] dir =>', dir, 'slug =>', slug);
        // Phase 7
        console.trace('[App:handleOpenPost] ends');
    }

    function handleOpenPostConfig(dir, slug) {
        console.trace('[App:handleOpenPostConfig] begins');
        console.debug('[App:handleOpenPostConfig] dir =>', dir, 'slug =>', slug);
        // Phase 8
        console.trace('[App:handleOpenPostConfig] ends');
    }

    function handleOpenAppConfig() {
        console.trace('[App:handleOpenAppConfig] begins');
        // Phase 9
        console.trace('[App:handleOpenAppConfig] ends');
    }

    console.trace('[App] ends');

    return (
        <div id="app-shell" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

            {/* Topbar — Phase 2 */}
            <Topbar />

            {/* Body row */}
            <div id="body-row">

                {/* Sidebar — Phase 3 */}
                <Sidebar
                    onOpenConfig={handleOpenConfig}
                    onOpenPost={handleOpenPost}
                    onOpenPostConfig={handleOpenPostConfig}
                    onOpenAppConfig={handleOpenAppConfig}
                    activeSlug={null}
                    activeConfigSlug={null}
                />

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
