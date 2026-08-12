'use strict';

import React                       from 'react';
import { useAppState, Actions }    from '../store/appState.jsx';

// ----------------------------------------------------------
// Topbar — fixed strip across the top of the app shell
// Left:   hamburger toggle for sidebar
// Center: breadcrumb (idle) or status message (success/error/warning)
// Right:  empty (reserved for future use)
// ----------------------------------------------------------

// ----------------------------------------------------------
// buildBreadcrumb — derives breadcrumb string from app state
// Returns empty string for welcome view
// ----------------------------------------------------------
function buildBreadcrumb(currentView, activeProject, currentPost) {
    console.trace('[buildBreadcrumb] begins');

    const projectName = activeProject
        ? activeProject.split('/').filter(Boolean).pop()
        : null;

    let crumb = '';

    switch (currentView) {
        case 'welcome':
            crumb = '';
            break;

        case 'site-preview':
            crumb = projectName ? `${projectName} › Site Preview` : 'Site Preview';
            break;

        case 'post-editor':
            crumb = projectName && currentPost
                ? `${projectName} › ${currentPost}`
                : projectName || '';
            break;

        case 'config-form':
            crumb = projectName ? `${projectName} › Site Config` : 'Site Config';
            break;

        case 'post-settings':
            crumb = projectName && currentPost
                ? `${projectName} › ${currentPost} › Settings`
                : projectName || '';
            break;

        case 'app-config':
            crumb = 'App Settings';
            break;

        default:
            crumb = '';
    }

    console.debug('[buildBreadcrumb] crumb =>', crumb);
    console.trace('[buildBreadcrumb] ends');
    return crumb;
}

// ----------------------------------------------------------
// Topbar component
// ----------------------------------------------------------
export default function Topbar({ currentPost }) {
    console.trace('[Topbar] begins');

    const { state, dispatch } = useAppState();

    const { statusMsg, currentView, activeProject, sidebarCollapsed } = state;

    // center shows status message when state is not idle
    // otherwise shows breadcrumb
    const showStatus  = statusMsg.state !== 'idle' && statusMsg.msg !== '';
    const centerText  = showStatus
        ? statusMsg.msg
        : buildBreadcrumb(currentView, activeProject, currentPost);

    const centerClass = showStatus ? `status ${statusMsg.state}` : 'breadcrumb';

    function handleToggle() {
        console.trace('[Topbar:handleToggle] begins');
        dispatch({ type: Actions.TOGGLE_SIDEBAR });
        console.trace('[Topbar:handleToggle] ends');
    }

    console.trace('[Topbar] ends');

    return (
        <div id="topbar">
            {/* Left — sidebar toggle */}
            <button
                id="menu-toggle"
                onClick={handleToggle}
                title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            >
                &#9776;
            </button>

            {/* Center — breadcrumb or status */}
            <span id="status" className={centerClass}>
                {centerText}
            </span>

            {/* Right — reserved */}
            <div id="topbar-right" />
        </div>
    );
}
