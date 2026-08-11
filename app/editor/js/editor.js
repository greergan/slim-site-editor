'use strict';

import { initSidebar }   from './sidebar.js';
import { initProjects }  from './projects.js';
import { initView }      from './editor-view.js';
import { initSaveBuild } from './save-build.js';
import { initAppConfig } from './app-config.js';

// ----------------------------------------------------------
// Partial loader
// ----------------------------------------------------------
async function loadPartial(targetId, url) {
    const res  = await fetch(url);
    const html = await res.text();
    document.getElementById(targetId).innerHTML = html;
}

// ----------------------------------------------------------
// Status helpers
// ----------------------------------------------------------
export function setStatus(msg) {
    document.getElementById('status').textContent = msg;
}

export function setSaveStatus(msg) {
    document.getElementById('save-status').textContent = msg;
}

// ----------------------------------------------------------
// Init
// ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', async function() {

    // load partials
    await loadPartial('sidebar', 'partials/sidebar.html');
    await loadPartial('main',    'partials/main.html');

    // set app name from package.json
    const name = await window.api.appName();
    document.title = name;
    document.getElementById('app-name').textContent = name;

    // init subsystems
    initSidebar();
    initProjects();
    initView();
    initSaveBuild();
    initAppConfig();
});
