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
// state: 'idle' | 'info' | 'success' | 'error' | 'warning'
// success auto-clears after 3s
// ----------------------------------------------------------
export function setStatus(msg, state = 'idle') {
    const el = document.getElementById('status');
    el.textContent = msg;
    el.className   = state;

    if (state === 'success') {
        setTimeout(function () {
            if (el.textContent === msg) {
                el.textContent = '';
                el.className   = 'idle';
            }
        }, 3000);
    }
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

    // set window title from package.json
    const name = await window.api.appName();
    document.title = name;

    // init subsystems
    initSidebar();
    initProjects();
    initView();
    initSaveBuild();
    initAppConfig();
});
