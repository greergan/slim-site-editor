'use strict';

import React, { useEffect, useState }    from 'react';
import { useAppState, Actions, setStatus } from '../store/appState.jsx';
import { useProjects }               from '../hooks/useProjects.js';
import ProjectList                   from './sidebar/ProjectList.jsx';
import AddProject                    from './sidebar/AddProject.jsx';

// ----------------------------------------------------------
// Sidebar — left panel
// Sections in order: App Config, Add Project, Projects
// ----------------------------------------------------------
export default function Sidebar({ onOpenConfig, onOpenPost, onOpenPostConfig, onOpenAppConfig, activeSlug, activeConfigSlug }) {
    console.trace('[Sidebar] begins');

    const { state, dispatch } = useAppState();

    const {
        projects,
        lastActive,
        loadProjects,
        activateProject,
        removeProject,
        archiveProject,
    } = useProjects();

    const [expandDir, setExpandDir] = useState(null);

    // ----------------------------------------------------------
    // Load projects on mount
    // ----------------------------------------------------------
    useEffect(function () {
        console.trace('[Sidebar:useEffect:loadProjects] begins');
        loadProjects();
        console.trace('[Sidebar:useEffect:loadProjects] ends');
    }, [loadProjects]);

    // ----------------------------------------------------------
    // handleActivate — sets active project in store and starts preview
    // ----------------------------------------------------------
    async function handleActivate(dir) {
        console.trace('[Sidebar:handleActivate] begins');
        console.debug('[Sidebar:handleActivate] dir =>', dir);

        const result = await activateProject(dir);

        if (!result.ok) {
            console.debug('[Sidebar:handleActivate] activateProject failed =>', result.error);
            setStatus(dispatch, 'Preview server failed', 'error');
            console.trace('[Sidebar:handleActivate] ends — error');
            return;
        }

        if (!result.url) {
            console.debug('[Sidebar:handleActivate] no url returned =>', result);
            setStatus(dispatch, 'Preview server failed', 'error');
            console.trace('[Sidebar:handleActivate] ends — no url');
            return;
        }

        dispatch({ type: Actions.SET_ACTIVE_PROJECT, payload: dir });
        dispatch({ type: Actions.SET_PREVIEW_URL,    payload: result.url });
        dispatch({ type: Actions.SET_VIEW,           payload: 'site-preview' });

        console.debug('[Sidebar:handleActivate] preview url =>', result.url);
        console.trace('[Sidebar:handleActivate] ends');
    }

    // ----------------------------------------------------------
    // handleRemove — removes project and reloads list
    // ----------------------------------------------------------
    async function handleRemove(dir) {
        console.trace('[Sidebar:handleRemove] begins');
        console.debug('[Sidebar:handleRemove] dir =>', dir);

        const result = await removeProject(dir);

        if (!result.ok) {
            console.debug('[Sidebar:handleRemove] failed =>', result.error);
            setStatus(dispatch, 'Delete failed: ' + (result.error || 'unknown'), 'error');
            console.trace('[Sidebar:handleRemove] ends — error');
            return;
        }

        setStatus(dispatch, 'Project deleted', 'success');

        // if the deleted project was active — reset to welcome
        if (dir === state.activeProject) {
            console.debug('[Sidebar:handleRemove] deleted project was active — resetting view');
            dispatch({ type: Actions.SET_ACTIVE_PROJECT, payload: null });
            dispatch({ type: Actions.SET_PREVIEW_URL,    payload: null });
            dispatch({ type: Actions.SET_VIEW,           payload: 'welcome' });
        }

        console.trace('[Sidebar:handleRemove] ends');
    }

    // ----------------------------------------------------------
    // handleArchive — stub
    // ----------------------------------------------------------
    async function handleArchive(dir) {
        console.trace('[Sidebar:handleArchive] begins');
        console.debug('[Sidebar:handleArchive] dir =>', dir);
        await archiveProject(dir);
        console.trace('[Sidebar:handleArchive] ends');
    }

    // ----------------------------------------------------------
    // handleProjectAdded — reload projects, expand new row
    // ----------------------------------------------------------
    async function handleProjectAdded(dir) {
        console.trace('[Sidebar:handleProjectAdded] begins');
        console.debug('[Sidebar:handleProjectAdded] dir =>', dir);
        await loadProjects();
        await handleActivate(dir);
        setExpandDir(dir);
        console.trace('[Sidebar:handleProjectAdded] ends');
    }

    console.trace('[Sidebar] ends');

    return (
        <div id="sidebar" className={state.sidebarCollapsed ? 'collapsed' : ''}>

            {/* App Config — top of sidebar */}
            <div
                className="sidebar-section-header"
                id="nav-app-config"
                onClick={onOpenAppConfig}
            >
                <span>App Config</span>
            </div>

            {/* Add Project */}
            <AddProject onProjectAdded={handleProjectAdded} />

            {/* Projects */}
            <ProjectList
                projects={projects}
                lastActive={lastActive}
                expandDir={expandDir}
                onActivate={handleActivate}
                onRemove={handleRemove}
                onArchive={handleArchive}
                onOpenConfig={onOpenConfig}
                onOpenPost={onOpenPost}
                onOpenPostConfig={onOpenPostConfig}
                activeSlug={activeSlug}
                activeConfigSlug={activeConfigSlug}
            />

        </div>
    );
}
