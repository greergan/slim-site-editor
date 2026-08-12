'use strict';

import React, { useEffect }  from 'react';
import { useAppState, Actions } from './store/appState.jsx';
import { loadInitialPreview }   from './hooks/usePreview.js';
import Topbar          from './components/Topbar.jsx';
import Sidebar         from './components/Sidebar.jsx';
import AppConfig       from './components/views/AppConfig.jsx';
import SitePreview     from './components/views/SitePreview.jsx';

// ----------------------------------------------------------
// App — top level layout
// ----------------------------------------------------------
export default function App() {
    console.trace('[App] begins');

    const { state, dispatch } = useAppState();

    console.debug('[App] currentView =>', state.currentView);
    console.debug('[App] activeProject =>', state.activeProject);
    console.debug('[App] sidebarCollapsed =>', state.sidebarCollapsed);
    console.debug('[App] previewUrl =>', state.previewUrl);

    // ----------------------------------------------------------
    // On mount — check if preview server already running
    // (main process starts it for lastActive on launch)
    // ----------------------------------------------------------
    useEffect(function () {
        console.trace('[App:useEffect:loadInitialPreview] begins');
        loadInitialPreview(dispatch);
        console.trace('[App:useEffect:loadInitialPreview] ends');
    }, []);

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
        dispatch({ type: Actions.SET_VIEW, payload: 'app-config' });
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

                {/* Main */}
                <div id="main">
                    {/* SitePreview stays mounted — hidden/shown via CSS */}
                    <SitePreview />

                    {state.currentView === 'app-config' && <AppConfig />}

                    {state.currentView !== 'app-config' && state.currentView !== 'site-preview' && (
                        <div id="empty-state" className="visible">
                            open or create a project to get started
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}
