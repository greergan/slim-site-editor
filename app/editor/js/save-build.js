'use strict';

import { setStatus, setSaveStatus } from './editor.js';

// ----------------------------------------------------------
// Save
// ----------------------------------------------------------
export async function doSave() {
    // TODO: await window.api.savePost({
    //     slug: _currentSlug,
    //     post: currentPost()
    // });

    setSaveStatus('saved');
    setStatus('doSave stub — IPC not wired yet');
}

// ----------------------------------------------------------
// Build
// ----------------------------------------------------------
export async function doBuild() {
    // TODO: await window.api.triggerBuild();
    setStatus('doBuild stub — IPC not wired yet');
}

// ----------------------------------------------------------
// Error modal
// ----------------------------------------------------------
export function showError(msg) {
    document.getElementById('error-modal-msg').textContent = msg;
    document.getElementById('error-modal-overlay').classList.add('visible');
}

export function hideError() {
    document.getElementById('error-modal-overlay').classList.remove('visible');
    document.getElementById('error-modal-msg').textContent = '';
}

// ----------------------------------------------------------
// Init — expose functions window needs for inline onclick handlers
// ----------------------------------------------------------
export function initSaveBuild() {
    window.doSave    = doSave;
    window.doBuild   = doBuild;
    window.hideError = hideError;

    // wire global error display event
    window.addEventListener('app:show-error', function(e) {
        showError(e.detail);
    });
}
