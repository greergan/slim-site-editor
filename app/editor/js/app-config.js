'use strict';

import { setStatus } from './editor.js';

// ----------------------------------------------------------
// Open app config
// ----------------------------------------------------------
export async function openAppConfig() {
    // TODO: const data = await window.api.getAppConfig();
    // show raw-editor with data.config
    setStatus('openAppConfig stub — IPC not wired yet');
}

// ----------------------------------------------------------
// Init — expose functions window needs for inline onclick handlers
// ----------------------------------------------------------
export function initAppConfig() {
    window.openAppConfig = openAppConfig;
}
