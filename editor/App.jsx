'use strict';

import React, { useEffect }  from 'react';
import { useAppState, Actions } from './store/appState.jsx';
import { loadInitialPreview }   from './hooks/usePreview.js';
import Topbar          from './components/Topbar.jsx';
import Sidebar         from './components/Sidebar.jsx';
import AppConfig       from './components/views/AppConfig.jsx';
import SiteConfig      from './components/views/SiteConfig.jsx';
import PostEditor      from './components/views/PostEditor.jsx';
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
    // On mount — load autoSaveDelay from app config into store
    // ----------------------------------------------------------
    useEffect(function () {
        console.trace('[App:useEffect:loadAutoSaveDelay] begins');

        async function loadAutoSaveDelay() {
            try {
                const res = await window.api.getAppConfig();
                console.debug('[App:useEffect:loadAutoSaveDelay] result =>', res);

                if (res.ok && res.config.autoSaveDelay) {
                    dispatch({ type: Actions.SET_AUTO_SAVE_DELAY, payload: res.config.autoSaveDelay });
                    console.debug('[App:useEffect:loadAutoSaveDelay] autoSaveDelay =>', res.config.autoSaveDelay);
                }
            } catch (e) {
                console.debug('[App:useEffect:loadAutoSaveDelay] exception =>', e.message);
            }
        }

        loadAutoSaveDelay();

        console.trace('[App:useEffect:loadAutoSaveDelay] ends');
    }, []);

    // ----------------------------------------------------------
    // Sidebar navigation handlers — passed down to Sidebar
    // Phases 6-9 will wire these to real views
    // ----------------------------------------------------------
    function handleOpenConfig(dir) {
        console.trace('[App:handleOpenConfig] begins');
        console.debug('[App:handleOpenConfig] dir =>', dir);
        dispatch({ type: Actions.SET_CONFIG_DIR, payload: dir });
        dispatch({ type: Actions.SET_VIEW,       payload: 'config-form' });
        console.trace('[App:handleOpenConfig] ends');
    }

    function handleProjectNameChange(dir, name) {
        console.trace('[App:handleProjectNameChange] begins');
        console.debug('[App:handleProjectNameChange] dir =>', dir, 'name =>', name);
        // ProjectList manages its own project name display via the projects array
        // The sidebar re-renders when projects reload; name update is reflected on next load
        // For immediate sidebar label update this would require a projects refresh or
        // a dedicated callback into ProjectList — deferred to Phase 6 gate review
        console.trace('[App:handleProjectNameChange] ends');
    }

    function handleOpenPost(dir, slug) {
        console.trace('[App:handleOpenPost] begins');
        console.debug('[App:handleOpenPost] dir =>', dir, 'slug =>', slug);
        dispatch({ type: Actions.SET_POST, payload: { dir, slug } });
        dispatch({ type: Actions.SET_VIEW, payload: 'post-editor' });
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

                    {state.currentView === 'app-config'   && <AppConfig />}
                    {state.currentView === 'config-form'  && <SiteConfig onProjectNameChange={handleProjectNameChange} />}
                    {state.currentView === 'post-editor'  && <PostEditor />}

                    {state.currentView !== 'app-config'  &&
                     state.currentView !== 'config-form' &&
                     state.currentView !== 'post-editor' &&
                     state.currentView !== 'site-preview' && (
                        <div id="empty-state" className="visible">
                            open or create a project to get started
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}
